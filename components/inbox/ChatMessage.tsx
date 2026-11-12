import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { VideoPlayer } from "@/components/shared/VideoPlayer";

interface ChatMessageProps {
  id: string;
  from: "me" | "them";
  text: string;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  when: string;
  contactName: string;
  myAvatar: string;
  contactAvatar: string;
}

export const ChatMessage = memo(function ChatMessage({
  from,
  text,
  photoUrl,
  videoUrl,
  videoThumbnailUrl,
  when,
  contactName,
  myAvatar,
  contactAvatar,
}: ChatMessageProps) {
  return (
    <div>
      {/* Sender name */}
      {from === "me" ? (
        <div className="text-[13px] font-semibold text-black">You</div>
      ) : (
        <Link
          href={`/profile/${nameToSlug(contactName)}`}
          className="text-[13px] font-semibold text-linkblue hover:text-linkblue/80"
          prefetch={true}
        >
          {contactName}
        </Link>
      )}
      <div className="mt-1 flex items-start gap-2">
        <Image
          src={from === "me" ? myAvatar : contactAvatar}
          alt={from === "me" ? "Twelvee" : `${contactName}'s avatar`}
          width={40}
          height={40}
          sizes="40px"
          className="aspect-square h-[40px] w-[40px] min-w-[40px] shrink-0 object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="whitespace-pre-wrap break-words bg-white text-[14px] leading-5 text-black">
            {text}
          </div>
          {photoUrl && (
            <div className="mt-2">
              <Image
                src={photoUrl}
                alt="Message photo"
                width={320}
                height={320}
                sizes="(max-width: 768px) 100vw, 320px"
                className="aspect-square max-w-full object-contain"
              />
            </div>
          )}
          {videoUrl && (
            <div className="mt-2">
              <VideoPlayer
                src={videoUrl}
                poster={videoThumbnailUrl}
                label="Message video"
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="mt-1 text-[11px] text-gray-500">{when} ·</div>
            <div className="mt-1 text-[11px] text-linkblue">
              Sent from Twelveebook
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
