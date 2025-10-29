import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { Metadata } from "next";
import { getChats } from "@/lib/cms";
import { formatTimestampFor2012 } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Twelveebook | Inbox",
  description: "0.twelveebook.com",
};

export default async function Inbox() {
  const chats = await getChats();

  // Sort chats by lastMessageAt (newest first)
  const sortedChats = [...chats].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt).getTime();
    const timeB = new Date(b.lastMessageAt).getTime();
    return timeB - timeA; // descending order (newest first)
  });

  return (
    <div className="container mx-auto bg-white p-2 text-black">
      <h1 className="mb-2 text-2xl font-bold">Inbox ({sortedChats.length})</h1>
      <div className="divide-y">
        {sortedChats.map((chat) => (
          <Link
            key={chat.id}
            href={`/inbox/${nameToSlug(chat.contact.name)}`}
            className="-mx-2 flex items-start justify-between gap-3 rounded px-2 py-4 hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={chat.contact.avatar}
                alt={chat.contact.name}
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />
              <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                <span className="text-base font-bold leading-5 text-black">
                  {chat.contact.name}
                </span>
                {chat.unread ? ( <span className="truncate text-sm leading-5 text-black font-bold">
                  {chat.preview}
                </span> ) : ( <span className="truncate text-sm leading-5 text-gray-700">
                  {chat.preview}
                </span> )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              {chat.unread ? (
                <span className="whitespace-nowrap text-sm text-gray-600">
                  <span className=" text-black">•</span> <span className="text-black font-bold">{formatTimestampFor2012(chat.lastMessageAt)}</span>
                </span>
              ) : (
                <span className="whitespace-nowrap text-sm text-gray-600">
                  {formatTimestampFor2012(chat.lastMessageAt)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
