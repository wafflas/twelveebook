import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PostCard } from "@/components/posts/PostCard";
import { ChatThreadView } from "@/components/inbox/ChatThreadView";
import { VideoPlayer } from "@/components/shared/VideoPlayer";

vi.mock("@/lib/hooks", () => ({
  useLikes: () => ({
    likes: 0,
    likedByVisitor: false,
    loading: false,
    toggleLike: vi.fn(),
  }),
}));

const videoUrl = "https://cdn.sanity.io/files/project/production/clip.mp4";
const author = { name: "Twelvee", avatar: "/avatars/twelvee.png" };
const timestamp = "2026-11-12T10:00:00Z";

function mountPlayer(duration = 10, poster?: string) {
  const view = render(
    <VideoPlayer src={videoUrl} poster={poster} label="Video preview" />,
  );
  const video = screen.getByLabelText<HTMLVideoElement>("Video preview");
  Object.defineProperty(video, "duration", {
    configurable: true,
    value: duration,
  });
  return { video, ...view };
}

describe("video preview frames", () => {
  it("shows a configured poster without seeking or starting playback", () => {
    const { video } = mountPlayer(10, "/thumbnail.jpg");
    fireEvent.loadedMetadata(video);
    fireEvent.loadedData(video);
    expect(video).toHaveAttribute("poster", "/thumbnail.jpg");
    expect(video.currentTime).toBe(0);
    expect(video.paused).toBe(true);
  });

  it("can request the preview when the first frame finishes loading", () => {
    const { video } = mountPlayer();
    fireEvent.loadedData(video);
    expect(video.currentTime).toBe(0.1);
    expect(video.paused).toBe(true);
  });

  it("requests a preview frame while leaving the video paused", () => {
    const { video } = mountPlayer();
    fireEvent.loadedMetadata(video);
    expect(video.currentTime).toBe(0.1);
    expect(video.paused).toBe(true);
    expect(video.autoplay).toBe(false);
  });

  it("starts playback from the beginning after showing the preview", () => {
    const { video } = mountPlayer();
    fireEvent.loadedMetadata(video);
    fireEvent.play(video);
    expect(video.currentTime).toBe(0);
  });

  it("does not reset later playback or a visitor's chosen playback position", () => {
    const { video } = mountPlayer();
    fireEvent.loadedMetadata(video);
    video.currentTime = 4;
    fireEvent.play(video);
    expect(video.currentTime).toBe(4);
    video.currentTime = 6;
    fireEvent.play(video);
    expect(video.currentTime).toBe(6);
  });

  it("selects a frame inside even a very short video", () => {
    const { video } = mountPlayer(0.05);
    fireEvent.loadedMetadata(video);
    expect(video.currentTime).toBe(0.025);
  });

  it.each([0, NaN, Infinity])(
    "does not seek when the duration is unusable (%s)",
    (duration) => {
      const { video } = mountPlayer(duration);
      fireEvent.loadedMetadata(video);
      expect(video.currentTime).toBe(0);
    },
  );

  it("does not interrupt playback if the visitor starts before metadata loads", () => {
    const { video } = mountPlayer();
    Object.defineProperty(video, "paused", {
      configurable: true,
      value: false,
    });
    fireEvent.loadedMetadata(video);
    expect(video.currentTime).toBe(0);
  });

  it("does not apply a previous video's preview to a new source", () => {
    const { video, rerender } = mountPlayer();
    fireEvent.loadedMetadata(video);
    rerender(<VideoPlayer src="/another-video.mp4" label="Video preview" />);
    fireEvent.play(video);
    expect(video.currentTime).toBe(0.1);
  });
});

describe("video attachments", () => {
  it("passes a post's video through to the player alongside its text and photo", () => {
    render(
      <PostCard
        id="post-video"
        author={author}
        content="New clip"
        timestamp={timestamp}
        photoUrl="/avatars/twelvee.png"
        videoUrl={videoUrl}
        videoThumbnailUrl="/thumbnail.jpg"
      />,
    );

    expect(screen.getByText("New clip")).toBeInTheDocument();
    expect(screen.getByAltText("Post photo")).toBeInTheDocument();
    const video = screen.getByLabelText("Post video");
    expect(video).toHaveAttribute("src", videoUrl);
    expect(video).toHaveAttribute("poster", "/thumbnail.jpg");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).not.toHaveAttribute("autoplay");
  });

  it("keeps existing text-only posts free of an empty video player", () => {
    const { container } = render(
      <PostCard
        id="post-text"
        author={author}
        content="Just text"
        timestamp={timestamp}
        videoThumbnailUrl="/thumbnail-without-video.jpg"
      />,
    );

    expect(screen.getByText("Just text")).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("passes image and video attachments through the thread while preserving text-only messages", () => {
    const { container } = render(
      <ChatThreadView
        contactName="Stolou"
        myAvatar={author.avatar}
        contactAvatar={author.avatar}
        messages={[
          {
            id: "message-video",
            from: "them",
            text: "Watch this",
            when: "just now",
            photoUrl: "/avatars/twelvee.png",
            videoUrl,
            videoThumbnailUrl: "/thumbnail.jpg",
          },
          {
            id: "message-text",
            from: "me",
            text: "Nice clip",
            when: "just now",
          },
        ]}
      />,
    );

    expect(screen.getByText("Watch this")).toBeInTheDocument();
    expect(screen.getByText("Nice clip")).toBeInTheDocument();
    expect(screen.getAllByAltText("Message photo")).toHaveLength(1);
    expect(screen.getByAltText("Message photo")).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent("/avatars/twelvee.png")),
    );
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(screen.getByLabelText("Message video")).toHaveAttribute(
      "poster",
      "/thumbnail.jpg",
    );
    expect(screen.getByLabelText("Message video")).toHaveAttribute(
      "src",
      videoUrl,
    );
  });
});
