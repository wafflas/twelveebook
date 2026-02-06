import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ chatId: string }> };

// Redis key for tracking when visitors last read a chat
function lastReadKey(chatId: string) {
  return `chat:lastread:${chatId}`;
}

/**
 * GET: Check if current visitor has read this chat (with latest message timestamp)
 */
export async function GET(req: Request, { params }: RouteParams) {
  const { chatId } = await params;
  const url = new URL(req.url);
  const latestMessageTime = url.searchParams.get("latestMessageTime");

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("visitorId")?.value;

  if (!visitorId) {
    return NextResponse.json({ hasRead: false });
  }

  // Get when visitor last read this chat
  const lastReadTime = await redis.hget(lastReadKey(chatId), visitorId);

  if (!lastReadTime || !latestMessageTime) {
    return NextResponse.json({ hasRead: false });
  }

  // Compare timestamps: has read if last read time >= latest message time
  const hasRead =
    new Date(lastReadTime as string) >= new Date(latestMessageTime);

  return NextResponse.json({ hasRead, lastReadTime });
}

/**
 * POST: Mark chat as read for current visitor with current timestamp
 */
export async function POST(_req: Request, { params }: RouteParams) {
  const { chatId } = await params;

  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitorId")?.value;
  let setVisitorCookie = false;

  // Create visitorId if doesn't exist
  if (!visitorId) {
    visitorId = uuidv4();
    setVisitorCookie = true;
  }

  // Store current timestamp as last read time for this visitor
  const now = new Date().toISOString();
  await redis.hset(lastReadKey(chatId), { [visitorId]: now });

  // Revalidate the inbox page so it shows updated read status
  revalidatePath("/inbox");

  const res = NextResponse.json({ hasRead: true, chatId, lastReadTime: now });

  // Set cookie if new visitor
  if (setVisitorCookie && visitorId) {
    res.cookies.set("visitorId", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return res;
}
