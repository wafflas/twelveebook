import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { redis, inboxRateLimit, getClientIpFromRequest } from "@/lib/redis";
import { isValidDocumentId } from "@/lib/utils";

type RouteParams = { params: Promise<{ chatId: string }> };

function lastReadKey(chatId: string) {
  return `chat:lastread:${chatId}`;
}

export async function GET(req: Request, { params }: RouteParams) {
  const { chatId } = await params;
  if (!isValidDocumentId(chatId)) {
    return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
  }

  const ip = getClientIpFromRequest(req);
  const { success } = await inboxRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(req.url);
  const latestMessageTime = url.searchParams.get("latestMessageTime");

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("visitorId")?.value;

  if (!visitorId) {
    return NextResponse.json({ hasRead: false });
  }

  const lastReadTime = await redis.hget(lastReadKey(chatId), visitorId);

  if (!lastReadTime || !latestMessageTime) {
    return NextResponse.json({ hasRead: false });
  }

  const hasRead =
    new Date(lastReadTime as string) >= new Date(latestMessageTime);

  return NextResponse.json({ hasRead, lastReadTime });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { chatId } = await params;
  if (!isValidDocumentId(chatId)) {
    return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
  }

  const ip = getClientIpFromRequest(req);
  const { success } = await inboxRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitorId")?.value;
  let setVisitorCookie = false;

  if (!visitorId) {
    visitorId = uuidv4();
    setVisitorCookie = true;
  }

  const now = new Date().toISOString();
  await redis.hset(lastReadKey(chatId), { [visitorId]: now });

  const res = NextResponse.json({ hasRead: true, chatId, lastReadTime: now });

  if (setVisitorCookie && visitorId) {
    res.cookies.set("visitorId", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
