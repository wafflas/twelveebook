import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { Metadata } from "next";
import { getChats, getChatByContact } from "@/lib/cms";
import { formatTimestampFor2012 } from "@/lib/utils";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

// Helper function to check if visitor has read a chat since it was marked unread
async function hasVisitorReadSinceMarkedUnread(
  chatId: string,
  unreadSince?: string,
): Promise<boolean> {
  const cookieStore = cookies();
  const visitorId = cookieStore.get("visitorId")?.value;

  if (!visitorId) return false;


  const lastReadTime = await redis.hget(`chat:lastread:${chatId}`, visitorId);

  if (!lastReadTime) return false;

  if (!unreadSince) return true;

  try {
    return new Date(lastReadTime as string) >= new Date(unreadSince);
  } catch (error) {
    console.error("Error comparing timestamps:", error);
    return false;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const chats = await getChats();

  let unreadCount = 0;

  // Count unread chats
  for (const chat of chats) {
    if (chat.unread) {
      const hasRead = await hasVisitorReadSinceMarkedUnread(
        chat.id,
        chat.unreadSince,
      );
      if (!hasRead) {
        unreadCount++;
      }
    }
  }

  const title =
    unreadCount > 0
      ? `Twelveebook | Inbox (${unreadCount})`
      : "Twelveebook | Inbox";

  return {
    title,
    description: "0.twelveebook.com",
  };
}

export default async function Inbox() {
  const chats = await getChats();

  const enrichedChats = await Promise.all(
    chats.map(async (chat) => {
      const { messages } = await getChatByContact(chat.contact.name);
      if (!messages || messages.length === 0) return chat;

      const last = messages[messages.length - 1];
      const isFromMe = last?.sender?.name?.toLowerCase() === "twelvee";

      const hasRead = await hasVisitorReadSinceMarkedUnread(
        chat.id,
        chat.unreadSince,
      );

      return {
        ...chat,
        preview: `${isFromMe ? "You: " : ""}${last.text}`,
        lastMessageAt: last.createdAt,
        unread: chat.unread && !hasRead,
      };
    }),
  );

  const sortedChats = [...enrichedChats].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt).getTime();
    const timeB = new Date(b.lastMessageAt).getTime();
    return timeB - timeA;
  });

  const unreadCount = sortedChats.filter((chat) => chat.unread).length;

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-2 text-2xl font-bold">Inbox</h1>
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
                alt={`${chat.contact.name}'s avatar`}
                width={48}
                height={48}
                sizes="48px"
                className="h-12 w-12 object-cover"
                loading="lazy"
              />
              <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                <span className="text-base font-bold leading-5 text-black">
                  {chat.contact.name}
                </span>
                {chat.unread ? (
                  <span className="truncate text-sm font-bold leading-5 text-black">
                    {chat.preview}
                  </span>
                ) : (
                  <span className="truncate text-sm leading-5 text-gray-700">
                    {chat.preview}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              {chat.unread ? (
                <span className="whitespace-nowrap text-sm text-gray-600">
                  <span className="text-black">•</span>{" "}
                  <span className="font-bold text-black">
                    {formatTimestampFor2012(chat.lastMessageAt)}
                  </span>
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
