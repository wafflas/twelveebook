"use client";

import React, { useRef } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  label: string;
}

export function VideoPlayer({ src, poster, label }: VideoPlayerProps) {
  const previewRef = useRef<{ src: string; time: number } | null>(null);

  const showPreview = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (
      poster ||
      !video.paused ||
      video.currentTime !== 0 ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    // Seeking requests an actual frame even when only metadata was preloaded.
    const time = Math.min(0.1, video.duration / 2);
    previewRef.current = { src, time };
    video.currentTime = time;
  };

  const startPlayback = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const preview = previewRef.current;
    previewRef.current = null;

    // Start at zero after showing the preview, but respect a visitor's seek.
    if (
      preview?.src === src &&
      Math.abs(video.currentTime - preview.time) < 0.02
    ) {
      video.currentTime = 0;
    }
  };

  return (
    <video
      src={src}
      poster={poster}
      aria-label={label}
      controls
      playsInline
      preload="metadata"
      onLoadedMetadata={showPreview}
      onLoadedData={showPreview}
      onPlay={startPlayback}
      className="block aspect-square w-[320px] max-w-full bg-black object-cover"
    >
      Your browser does not support video playback.{" "}
      <a href={src}>Download video</a>
    </video>
  );
}
