import React from "react";
import Link from "next/link";
import { slugToName, nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { getProfiles, getMessagesByContact, getChatByContact } from "@/lib/cms";
import { Message as CMSMessage } from "@/types/Message";
import ChatThread from "@/components/ChatThread";
import ChatReadMarker from "@/components/ChatReadMarker";

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

  const { chat } = await getChatByContact(contactName);
  const chatId = chat?.id || "";

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
    <div className="flex h-full flex-col bg-white text-black">
      {/* Auto-mark chat as read when page loads */}
      {chatId && <ChatReadMarker chatId={chatId} />}

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-[#f6f7f9] px-3 py-2 text-sm shadow-sm">
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

      {/* Thread with auto-scroll - now in a scrollable container */}
      <div className="flex-1 overflow-y-auto">
        <ChatThread
          messages={messages}
          contactName={contactName}
          myAvatar={myAvatar}
          contactAvatar={contactAvatar}
        />
      </div>
    </div>
  );
}
