"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  when: string;
};

interface ChatThreadProps {
  messages: Message[];
  contactName: string;
  myAvatar: string;
  contactAvatar: string;
}

export default function ChatThread({
  messages,
  contactName,
  myAvatar,
  contactAvatar,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on mount and when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return (
    <>
      {/* Thread */}
      <div className="space-y-4 px-3 py-3">
        {messages.map((m) => (
          <div key={m.id}>
            {/* Sender name */}
            {m.from === "me" ? (
              <div className="text-[13px] font-semibold text-black">You</div>
            ) : (
              <Link
                href={`/profile/${nameToSlug(contactName)}`}
                className="text-[13px] font-semibold text-linkblue hover:text-linkblue/80"
              >
                {contactName}
              </Link>
            )}
            <div className="mt-1 flex items-start gap-2">
              <Image
                src={m.from === "me" ? myAvatar : contactAvatar}
                alt={m.from === "me" ? "Twelvee" : contactName}
                width={40}
                height={40}
                className="object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="whitespace-pre-wrap break-words bg-white text-[14px] leading-5 text-black">
                  {m.text}
                </div>
                <div className="flex items-center gap-1">
                  <div className="mt-1 text-[11px] text-gray-500">
                    {m.when} ·
                  </div>
                  <div className="mt-1 text-[11px] text-linkblue">
                    Sent from Twelveebook
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-2 py-2 text-sm outline-none"
            placeholder={`Write a message…`}
            readOnly
          />
          <button
            className="rounded bg-linkblue px-3 py-2 text-sm text-white opacity-60"
            disabled
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
