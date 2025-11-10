import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { getChats } from "@/lib/cms";

/**
 * GET: Returns the number of unread chats for the current visitor
 */
export async function GET() {
  const cookieStore = cookies();
  const visitorId = cookieStore.get("visitorId")?.value;

  const chats = await getChats();

  let unreadCount = 0;

  for (const chat of chats) {
    // Chat is unread if: Contentful marks it unread AND visitor hasn't read since unreadSince
    const contentfulUnread = chat.unread ?? false;

    if (!contentfulUnread) {
      // Contentful doesn't mark it as unread, skip
      continue;
    }

    // Check if visitor has read since chat was marked unread
    if (visitorId) {
      const lastReadTime = await redis.hget(
        `chat:lastread:${chat.id}`,
        visitorId,
      );

      if (!lastReadTime) {
        unreadCount++;
      } else {
        if (!chat.unreadSince) {
          continue;
        }

        // Compare timestamps: has read if lastReadTime >= unreadSince
        const hasRead =
          new Date(lastReadTime as string) >= new Date(chat.unreadSince);
        if (!hasRead) {
          unreadCount++;
        }
      }
    } else {
      // No visitor ID yet, treat all contentful-unread chats as unread
      unreadCount++;
    }
  }

  return NextResponse.json({ unreadCount });
}
