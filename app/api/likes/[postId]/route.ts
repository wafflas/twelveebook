import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { redis, likeRateLimit, getClientIpFromRequest } from "@/lib/redis";

type RouteParams = { params: Promise<{ postId: string }> };

function countKey(postId: string) {
  return `likes:count:${postId}`;
}

function visitorsKey(postId: string) {
  return `likes:visitors:${postId}`;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { postId } = await params;
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("visitorId")?.value;

  const [rawCount, likedMember] = await Promise.all([
    redis.get<number>(countKey(postId)),
    visitorId
      ? redis.sismember(visitorsKey(postId), visitorId)
      : Promise.resolve(0),
  ]);

  const likes = typeof rawCount === "number" ? rawCount : 0;
  const likedByVisitor = likedMember === 1;

  return NextResponse.json({ likes, likedByVisitor });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { postId } = await params;
  const ip = getClientIpFromRequest(req);
  const { success, remaining, reset } = await likeRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining ?? 0),
          "X-RateLimit-Reset": String(reset),
        },
      },
    );
  }

  let action: "like" | "unlike";
  try {
    const body = await req.json();
    action = body?.action;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (action !== "like" && action !== "unlike") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitorId")?.value;
  let setVisitorCookie = false;
  if (!visitorId) {
    visitorId = uuidv4();
    setVisitorCookie = true;
  }

  const vKey = visitorsKey(postId);
  const cKey = countKey(postId);

  let likes: number;
  let likedByVisitor: boolean;

  if (action === "like") {
    const added = await redis.sadd(vKey, visitorId);
    if (added === 1) {
      likes = (await redis.incr(cKey)) ?? 0;
    } else {
      const existing = await redis.get<number>(cKey);
      likes = typeof existing === "number" ? existing : 0;
    }
    likedByVisitor = true;
  } else {
    const removed = await redis.srem(vKey, visitorId);
    if (removed === 1) {
      const dec = (await redis.decr(cKey)) ?? 0;
      if (dec < 0) {
        await redis.set(cKey, 0);
        likes = 0;
      } else {
        likes = dec;
      }
    } else {
      const existing = await redis.get<number>(cKey);
      likes = typeof existing === "number" ? existing : 0;
    }
    likedByVisitor = false;
  }

  const res = NextResponse.json({ likes, likedByVisitor });
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
