import { Chat } from "@/types/Chat";
import { Message } from "@/types/Message";
import { client } from "@/sanity/lib/client";
import { devLog, devWarn } from "@/lib/utils/logger";

const DEFAULT_AVATAR = "/avatars/twelvee.png";

const CHATS_QUERY = `*[_type == "chat"]{
  "id": _id,
  name,
  "createdAt": _createdAt,
  "contact": contact->{ "name": name, "avatar": avatar.asset->url },
  unread,
  unreadSince,
  "messages": messages[]->{
    "text": text,
    "createdAt": coalesce(createdAt, _createdAt)
  }
}`;

const CHAT_BY_CONTACT_QUERY = `*[_type == "chat" && contact->name == $contactName][0]{
  "id": _id,
  name,
  "createdAt": _createdAt,
  "contact": contact->{ "name": name, "avatar": avatar.asset->url },
  unread,
  unreadSince,
  "messages": messages[]->{
    "id": _id,
    name,
    "sender": sender->{ "name": name, "avatar": avatar.asset->url },
    "text": text,
    "createdAt": coalesce(createdAt, _createdAt)
  }
}`;

interface ContactResult {
  name: string | null;
  avatar: string | null;
}

interface ChatListResult {
  id: string;
  name?: string | null;
  createdAt: string;
  contact: ContactResult | null;
  unread?: boolean | null;
  unreadSince?: string | null;
  messages?: { text: string | null; createdAt: string }[] | null;
}

interface ChatMessageResult {
  id: string;
  name?: string | null;
  sender: ContactResult | null;
  text: string | null;
  createdAt: string;
}

interface ChatDetailResult {
  id: string;
  name?: string | null;
  createdAt: string;
  contact: ContactResult | null;
  unread?: boolean | null;
  unreadSince?: string | null;
  messages?: ChatMessageResult[] | null;
}

function latestMessage<T extends { createdAt: string }>(
  messages: T[] | null | undefined,
): T | undefined {
  if (!messages || messages.length === 0) return undefined;
  return [...messages].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || ""),
  )[0];
}

export async function getChats(): Promise<Chat[]> {
  try {
    devLog("Fetching chats from Sanity...");
    const chats = await client.fetch<ChatListResult[]>(
      CHATS_QUERY,
      {},
      { cache: "no-store" },
    );

    if (!chats) {
      devWarn("No chats found in response");
      return [];
    }

    const regularChats: Chat[] = chats.map((c) => {
      const last = latestMessage(c.messages);
      return {
        id: c.id,
        name: c.name ?? undefined,
        contact: {
          name: c.contact?.name || "Unknown",
          avatar: c.contact?.avatar || DEFAULT_AVATAR,
        },
        preview: last?.text || "",
        lastMessageAt: last?.createdAt || c.createdAt,
        unread: c.unread ?? false,
        unreadSince: c.unreadSince ?? undefined,
      };
    });

    // Also surface accepted message requests as chats
    const { getMessageRequests } = await import("./messageRequest");
    const acceptedRequests = await getMessageRequests("accepted");

    const requestsAsChats: Chat[] = acceptedRequests.map((request) => ({
      id: request.id,
      name: request.name,
      contact: {
        name: request.sender.name,
        avatar: request.sender.avatar,
      },
      preview: request.text,
      lastMessageAt: request.createdAt,
      unread: false,
      source: "messageRequest" as const,
    }));

    return [...regularChats, ...requestsAsChats];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity chats error:", message);
    return [];
  }
}

export async function getChatByContact(
  contactName: string,
): Promise<{ chat: Chat | null; messages: Message[] }> {
  try {
    const result = await client.fetch<ChatDetailResult | null>(
      CHAT_BY_CONTACT_QUERY,
      { contactName },
      { cache: "no-store" },
    );

    if (result) {
      const messages: Message[] = (result.messages ?? [])
        .map((msg) => ({
          id: msg.id,
          name: msg.name ?? undefined,
          chat: result.id,
          sender: {
            name: msg.sender?.name || "Unknown",
            avatar: msg.sender?.avatar || DEFAULT_AVATAR,
          },
          text: msg.text || "",
          createdAt: msg.createdAt,
        }))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      const last = latestMessage(result.messages);
      const chat: Chat = {
        id: result.id,
        name: result.name ?? undefined,
        contact: {
          name: result.contact?.name || "Unknown",
          avatar: result.contact?.avatar || DEFAULT_AVATAR,
        },
        preview: last?.text || "",
        lastMessageAt: last?.createdAt || result.createdAt,
        unread: result.unread ?? false,
        unreadSince: result.unreadSince ?? undefined,
      };

      return { chat, messages };
    }

    // No Chat found - check for an accepted, then pending, MessageRequest
    devLog(`No chat found for ${contactName}, checking message requests...`);
    const { getMessageRequests } = await import("./messageRequest");

    const acceptedRequests = await getMessageRequests("accepted");
    let messageRequest = acceptedRequests.find(
      (req) => req.sender.name === contactName,
    );

    if (!messageRequest) {
      const pendingRequests = await getMessageRequests("pending");
      messageRequest = pendingRequests.find(
        (req) => req.sender.name === contactName,
      );
    }

    if (!messageRequest) {
      devLog(`No message request found for ${contactName}`);
      return { chat: null, messages: [] };
    }

    const chat: Chat = {
      id: messageRequest.id,
      name: messageRequest.name,
      contact: {
        name: messageRequest.sender.name,
        avatar: messageRequest.sender.avatar,
      },
      preview: messageRequest.text,
      lastMessageAt: messageRequest.createdAt,
      unread: false,
      source: "messageRequest" as const,
    };

    const message: Message = {
      id: messageRequest.id,
      name: messageRequest.name,
      chat: messageRequest.id,
      sender: {
        name: messageRequest.sender.name,
        avatar: messageRequest.sender.avatar,
      },
      text: messageRequest.text,
      createdAt: messageRequest.createdAt,
    };

    return { chat, messages: [message] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity chat error:", message);
    return { chat: null, messages: [] };
  }
}
