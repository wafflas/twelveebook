import { NextRequest, NextResponse } from "next/server";
import { redis, likeRateLimit, getClientIpFromRequest } from "@/lib/redis";

interface RouteContext {
  params: Promise<{
    commentId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { commentId } = await context.params;
    const ip = getClientIpFromRequest(request);

    const likesKey = `comment:${commentId}:likes`;
    const likedSetKey = `comment:${commentId}:liked`;

    const [likes, likedByVisitor] = await Promise.all([
      redis.get<number>(likesKey),
      redis.sismember(likedSetKey, ip),
    ]);

    return NextResponse.json({
      likes: likes ?? 0,
      likedByVisitor: Boolean(likedByVisitor),
    });
  } catch (error) {
    console.error("Error fetching comment likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { commentId } = await context.params;
    const ip = getClientIpFromRequest(request);

    // Rate limiting
    const { success } = await likeRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json(
        { error: 'Invalid action. Must be "like" or "unlike".' },
        { status: 400 },
      );
    }

    const likesKey = `comment:${commentId}:likes`;
    const likedSetKey = `comment:${commentId}:liked`;

    let likes: number;
    let likedByVisitor: boolean;

    if (action === "like") {
      const added = await redis.sadd(likedSetKey, ip);
      if (added) {
        likes = await redis.incr(likesKey);
        likedByVisitor = true;
      } else {
        const currentLikes = await redis.get<number>(likesKey);
        likes = currentLikes ?? 0;
        likedByVisitor = true;
      }
    } else {
      // unlike
      const removed = await redis.srem(likedSetKey, ip);
      if (removed) {
        likes = await redis.decr(likesKey);
        likes = Math.max(0, likes);
        likedByVisitor = false;
      } else {
        const currentLikes = await redis.get<number>(likesKey);
        likes = currentLikes ?? 0;
        likedByVisitor = false;
      }
    }

    return NextResponse.json({
      likes,
      likedByVisitor,
    });
  } catch (error) {
    console.error("Error updating comment likes:", error);
    return NextResponse.json(
      { error: "Failed to update likes" },
      { status: 500 },
    );
  }
}

