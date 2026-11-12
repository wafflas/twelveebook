import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  attachmentCases,
  createSanityDataset,
  PHOTO_URL,
  querySanityDataset,
  reference,
  type SanityTestDocument,
} from "@/tests/helpers/sanity-media";
import { getPosts, getWallPosts } from "@/lib/cms/post";
import { getChatByContact, getChats } from "@/lib/cms/chat";
import { getMessagesByContact } from "@/lib/cms/message";
import {
  getMessageRequestById,
  getMessageRequests,
} from "@/lib/cms/messageRequest";

const fetchSanity = vi.hoisted(() => vi.fn());
vi.mock("@/sanity/lib/client", () => ({ client: { fetch: fetchSanity } }));

const timestamp = "2026-11-12T10:00:00Z";
let documents: SanityTestDocument[];

beforeEach(() => {
  documents = createSanityDataset();
  fetchSanity.mockReset().mockImplementation(querySanityDataset(documents));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function post(fields: Record<string, unknown> = {}): SanityTestDocument {
  return {
    _id: "post-test",
    _type: "post",
    _createdAt: timestamp,
    text: "Post caption",
    author: reference("profile-me"),
    ...fields,
  };
}

function message(fields: Record<string, unknown> = {}): SanityTestDocument {
  return {
    _id: "message-test",
    _type: "message",
    _createdAt: timestamp,
    createdAt: timestamp,
    text: "Message caption",
    sender: reference("profile-contact"),
    ...fields,
  };
}

function chat(messageIds = ["message-test"]): SanityTestDocument {
  return {
    _id: "chat-test",
    _type: "chat",
    _createdAt: timestamp,
    contact: reference("profile-contact"),
    messages: messageIds.map(reference),
  };
}

function request(fields: Record<string, unknown> = {}): SanityTestDocument {
  return {
    _id: "request-test",
    _type: "messageRequest",
    _createdAt: timestamp,
    createdAt: timestamp,
    text: "Request caption",
    sender: reference("profile-contact"),
    status: "pending",
    ...fields,
  };
}

describe.each(attachmentCases)("Sanity attachments: $label", (attachment) => {
  const expectedMedia = {
    photoUrl: attachment.photoUrl,
    videoUrl: attachment.videoUrl,
    videoThumbnailUrl: attachment.videoThumbnailUrl,
  };

  it("preserves attachment URLs in the home feed", async () => {
    documents.push(post(attachment.fields));
    const posts = await getPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: "post-test",
      content: "Post caption",
      author: { name: "Twelvee", avatar: PHOTO_URL },
      ...expectedMedia,
    });
  });

  it("preserves attachment URLs on an author's profile wall", async () => {
    documents.push(post(attachment.fields));
    const posts = await getWallPosts("profile-me");
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject(expectedMedia);
    expect(await getWallPosts("unrelated-profile")).toEqual([]);
  });

  it("preserves attachment URLs in a regular conversation", async () => {
    documents.push(message(attachment.fields), chat());
    const messages = await getMessagesByContact("sToLoU");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: "message-test",
      chat: "chat-test",
      text: "Message caption",
      sender: { name: "Stolou", avatar: PHOTO_URL },
      ...expectedMedia,
    });
  });

  it("preserves attachment URLs in the message-request list", async () => {
    documents.push(request(attachment.fields));
    const requests = await getMessageRequests("pending");
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      id: "request-test",
      text: "Request caption",
      status: "pending",
      ...expectedMedia,
    });
  });

  it("preserves attachment URLs when fetching a single request", async () => {
    documents.push(request(attachment.fields));
    expect(await getMessageRequestById("request-test")).toMatchObject({
      id: "request-test",
      ...expectedMedia,
    });
  });

  it.each(["pending", "accepted"])(
    "preserves attachments when a %s request becomes a conversation",
    async (status) => {
      documents.push(request({ ...attachment.fields, status }));
      const result = await getChatByContact("Stolou");
      expect(result.chat).toMatchObject({
        id: "request-test",
        source: "messageRequest",
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toMatchObject({
        id: "request-test",
        text: "Request caption",
        ...expectedMedia,
      });
    },
  );
});

describe("Sanity media query regressions", () => {
  const bothAttachments = attachmentCases.find(
    (attachment) => attachment.label === "photo and video together",
  )!;

  it("keeps attachments on posts where a profile is tagged", async () => {
    documents.push(
      post({
        ...bothAttachments.fields,
        taggedPeople: [reference("profile-contact")],
      }),
    );
    const posts = await getWallPosts("profile-contact");
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      photoUrl: bothAttachments.photoUrl,
      videoUrl: bothAttachments.videoUrl,
      taggedPeople: [{ name: "Stolou", avatar: PHOTO_URL }],
    });
  });

  it("keeps comment and reply photos when loading a post with a video", async () => {
    documents.push(
      post({ ...bothAttachments.fields, comments: [reference("comment")] }),
      {
        _id: "comment",
        _type: "comment",
        _createdAt: timestamp,
        text: "Comment",
        author: reference("profile-contact"),
        photos: bothAttachments.fields.photos,
        replies: [reference("reply")],
      },
      {
        _id: "reply",
        _type: "comment",
        _createdAt: timestamp,
        text: "Reply",
        author: reference("profile-me"),
        photos: bothAttachments.fields.photos,
      },
    );

    const posts = await getPosts();
    expect(posts[0]).toMatchObject({
      comments: 1,
      videoUrl: bothAttachments.videoUrl,
      commentsData: [
        {
          photoUrl: PHOTO_URL,
          replyCount: 1,
          replies: [{ photoUrl: PHOTO_URL, text: "Reply" }],
        },
      ],
    });
  });

  it("keeps message attachments and captions in chronological order for either sender", async () => {
    documents.push(
      message({ ...bothAttachments.fields, createdAt: "2026-11-12T11:00:00Z" }),
      message({
        _id: "older-message",
        ...bothAttachments.fields,
        sender: reference("profile-me"),
        createdAt: "2026-11-12T09:00:00Z",
        text: "Earlier caption",
      }),
      chat(["message-test", "older-message"]),
    );
    const { messages } = await getChatByContact("Stolou");
    expect(messages.map((entry) => entry.id)).toEqual([
      "older-message",
      "message-test",
    ]);
    expect(messages.map((entry) => entry.sender.name)).toEqual([
      "Twelvee",
      "Stolou",
    ]);
    for (const entry of messages) {
      expect(entry).toMatchObject({
        photoUrl: PHOTO_URL,
        videoUrl: bothAttachments.videoUrl,
      });
    }
    expect(messages[0].text).toBe("Earlier caption");
    expect(messages[1].text).toBe("Message caption");
  });

  it("preserves inbox previews for regular chats and accepted requests with attachments", async () => {
    documents.push(
      message(bothAttachments.fields),
      chat(),
      request({ ...bothAttachments.fields, status: "accepted" }),
    );
    expect(await getChats()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "chat-test",
          preview: "Message caption",
        }),
        expect.objectContaining({
          id: "request-test",
          preview: "Request caption",
          source: "messageRequest",
        }),
      ]),
    );
  });

  it("filters requests by status while retaining the attachments", async () => {
    documents.push(
      request(bothAttachments.fields),
      request({
        _id: "accepted-request",
        ...bothAttachments.fields,
        status: "accepted",
      }),
    );
    const requests = await getMessageRequests("accepted");
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      id: "accepted-request",
      photoUrl: PHOTO_URL,
      videoUrl: bothAttachments.videoUrl,
    });
  });

  it("returns empty results for missing posts, messages, and requests", async () => {
    expect(await getPosts()).toEqual([]);
    expect(await getWallPosts("unknown")).toEqual([]);
    expect(await getMessagesByContact("unknown")).toEqual([]);
    expect(await getMessageRequests()).toEqual([]);
    expect(await getMessageRequestById("unknown")).toBeNull();
  });

  it("uses safe empty results if Sanity is unavailable", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSanity.mockRejectedValue(new Error("Sanity unavailable"));

    expect(await getPosts()).toEqual([]);
    expect(await getWallPosts("profile-me")).toEqual([]);
    expect(await getChatByContact("Stolou")).toEqual({
      chat: null,
      messages: [],
    });
    expect(await getMessageRequests()).toEqual([]);
    expect(await getMessageRequestById("request-test")).toBeNull();
    expect(logError).toHaveBeenCalledTimes(5);
  });
});
