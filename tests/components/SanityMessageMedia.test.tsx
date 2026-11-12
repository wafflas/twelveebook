import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/(pages)/inbox/[slug]/page";
import {
  createSanityDataset,
  PHOTO_URL,
  THUMBNAIL_URL,
  querySanityDataset,
  reference,
  type SanityTestDocument,
} from "@/tests/helpers/sanity-media";

const fetchSanity = vi.hoisted(() => vi.fn());
vi.mock("@/sanity/lib/client", () => ({ client: { fetch: fetchSanity } }));

// Image optimization and read receipts are outside the attachment data flow.
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));
vi.mock("@/components/inbox/ChatReadMarker", () => ({
  ChatReadMarker: () => null,
}));

const timestamp = "2026-11-12T10:00:00Z";
let documents: SanityTestDocument[];

beforeEach(() => {
  documents = createSanityDataset();
  fetchSanity.mockReset().mockImplementation(querySanityDataset(documents));
});

describe("Sanity attachments through the conversation page", () => {
  it.each(["chat", "pending", "accepted"])(
    "renders a Sanity photo and MOV video from a %s conversation",
    async (source) => {
      const media = {
        photos: { _type: "image", asset: reference("image-photo") },
        video: { _type: "file", asset: reference("file-mov") },
        videoThumbnail: { _type: "image", asset: reference("image-thumbnail") },
      };
      if (source === "chat") {
        documents.push(
          {
            _id: "message",
            _type: "message",
            sender: reference("profile-contact"),
            text: "Caption from Sanity",
            createdAt: timestamp,
            ...media,
          },
          {
            _id: "chat",
            _type: "chat",
            contact: reference("profile-contact"),
            messages: [reference("message")],
            _createdAt: timestamp,
          },
        );
      } else {
        documents.push({
          _id: "request",
          _type: "messageRequest",
          sender: reference("profile-contact"),
          text: "Caption from Sanity",
          createdAt: timestamp,
          status: source,
          ...media,
        });
      }

      // Run the real server page, CMS adapters, queries, and message components.
      // Only the network transport, image optimizer, and read receipt are mocked.
      render(await ChatPage({ params: Promise.resolve({ slug: "stolou" }) }));

      expect(screen.getByText("Caption from Sanity")).toBeInTheDocument();
      expect(screen.getByAltText("Message photo")).toHaveAttribute(
        "src",
        PHOTO_URL,
      );
      expect(screen.getByLabelText("Message video")).toHaveAttribute(
        "poster",
        THUMBNAIL_URL,
      );
      expect(screen.getByLabelText("Message video")).toHaveAttribute(
        "src",
        "https://cdn.sanity.io/files/test/production/clip.mov",
      );
    },
  );
});
