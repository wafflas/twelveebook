import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  from: "me" | "them";
  text: string;
  when: string;
  contactName: string;
  myAvatar: string;
  contactAvatar: string;
}

export const ChatMessage = memo(function ChatMessage({
  from,
  text,
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
          className="h-[40px] w-[40px] min-w-[40px] shrink-0 object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="whitespace-pre-wrap break-words bg-white text-[14px] leading-5 text-black">
            {text}
          </div>
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
