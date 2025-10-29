import React from "react";
import Image from "next/image";
import Link from "next/link";
import { slugToName, nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { getProfiles, getMessagesByContact } from "@/lib/cms";
import { Message as CMSMessage } from "@/types/Message";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  when: string; // already formatted (e.g., "2 min ago")
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { slug } = await params;
  const contactName = slugToName(slug);

  const profiles = await getProfiles();
  const meProfile = profiles.find((p) => p.name.toLowerCase() === "twelvee");
  const myAvatar = meProfile?.avatar || "/avatars/twelvee.png";

  const contactProfile = profiles.find(
    (p) => p.name.toLowerCase() === contactName.toLowerCase(),
  );
  const contactAvatar = contactProfile?.avatar || `/avatars/${slug}.png`;

  const cmsMessages = await getMessagesByContact(contactName);

  // Sort messages chronologically (oldest first)
  const sortedMessages = [...cmsMessages].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB; // ascending order (oldest first)
  });

  const messages: Message[] = sortedMessages.map((msg: CMSMessage) => {
    const isFromMe = msg.sender.name.toLowerCase() === "twelvee";
    return {
      id: msg.id,
      from: isFromMe ? "me" : "them",
      text: msg.text,
      when: formatTimestampFor2012(msg.createdAt),
    };
  });

  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-0 text-black">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#f6f7f9] px-3 py-2 text-sm">
        <div>
          <span className="font-semibold">Conversation with </span>
          <Link
            href={`/profile/${nameToSlug(contactName)}`}
            className="text-linkblue hover:text-linkblue/80"
          >
            {contactName}
          </Link>
        </div>
        <Link href="/inbox" className="text-linkblue hover:underline">
          Back
        </Link>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 text-sm">
        <Link href="#" className="text-linkblue hover:underline">
          See Older Messages
        </Link>
      </div>

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
    </div>
  );
}
