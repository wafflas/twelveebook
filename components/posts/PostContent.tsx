import React, { memo } from "react";
import Image from "next/image";
import { TextWithMentions } from "@/components/shared/TextWithMentions";
import { VideoPlayer } from "@/components/shared/VideoPlayer";

interface PostContentProps {
  content: string;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
}

export const PostContent = memo(function PostContent({
  content,
  photoUrl,
  videoUrl,
  videoThumbnailUrl,
}: PostContentProps) {
  return (
    <>
      <TextWithMentions text={content} className="break-words" />

      {photoUrl && (
        <div className="mt-2">
          <Image
            src={photoUrl}
            alt="Post photo"
            width={320}
            height={320}
            sizes="(max-width: 768px) 100vw, 320px"
            className="post-photo aspect-square max-w-full object-cover"
          />
        </div>
      )}
      {videoUrl && (
        <div className="mt-2">
          <VideoPlayer
            src={videoUrl}
            poster={videoThumbnailUrl}
            label="Post video"
          />
        </div>
      )}
    </>
  );
});
