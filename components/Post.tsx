"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import "@/styles/globals.css";
interface PostProps {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  title?: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
}

export default function Post({
  id,
  author,
  title = "",
  content,
  timestamp,
  likes: initialLikes,
  comments = 0,
}: PostProps) {
  const [likes, setLikes] = useState<number>(initialLikes ?? 0);
  const [likedByVisitor, setLikedByVisitor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/likes/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setLikes(data.likes ?? 0);
          setLikedByVisitor(Boolean(data.likedByVisitor));
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    const action = likedByVisitor ? "unlike" : "like";
    // optimistic update
    setLikedByVisitor(!likedByVisitor);
    setLikes((l) => Math.max(0, l + (action === "like" ? 1 : -1)));
    try {
      const res = await fetch(`/api/likes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setLikes(data.likes ?? 0);
      setLikedByVisitor(Boolean(data.likedByVisitor));
    } catch {
      // revert on error
      setLikedByVisitor((v) => !v);
      setLikes((l) => Math.max(0, l + (action === "like" ? -1 : 1)));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="border-b-2 border-gray-100 bg-white">
        <div className="flex flex-row items-center gap-2 py-3">
          <Image src={author.avatar} alt={author.name} width={80} height={80} />
          <div className="flex flex-col text-sm">
            <Link href={`/profile/${nameToSlug(author.name)}`}>
              <h2 className="pb-1 text-sm text-linkblue hover:underline">
                {author.name}
              </h2>
            </Link>
            <p className="">{content}</p>
            <p className="text-xs text-timestampgray">
              {formatTimestampFor2012(timestamp)}
            </p>
            <div className="flex flex-row items-center gap-2 pt-2">
              <button
                onClick={toggleLike}
                disabled={loading}
                className={`rounded px-2 py-1 text-xs ${likedByVisitor ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                aria-pressed={likedByVisitor}
              >
                {likedByVisitor ? "♥ Liked" : "♡ Like"}
              </button>
              <p className="">{likes} likes</p>
              <p className="">{comments} comments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
