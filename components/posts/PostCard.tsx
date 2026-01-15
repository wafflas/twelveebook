"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { useLikes } from "@/lib/hooks";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostFooter } from "./PostFooter";
import "@/styles/globals.css";

interface PostCardProps {
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
  taggedPeople?: { name: string; avatar: string }[];
  location?: string;
  photoUrl?: string;
}

export function PostCard({
  id,
  author,
  content,
  timestamp,
  likes: initialLikes = 0,
  comments = 0,
  taggedPeople = [],
  location,
  photoUrl,
}: PostCardProps) {
  const { likes, likedByVisitor, loading, toggleLike } = useLikes({
    itemId: id,
    initialLikes,
    apiPath: "likes",
  });

  const handleToggleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    toggleLike();
  };

  return (
    <div className="bg-white">
      <div className="flex flex-row items-start gap-2 py-3">
        <Link href={`/profile/${nameToSlug(author.name)}`}>
          <Image src={author.avatar} alt={author.name} width={96} height={96} />
        </Link>

        <div className="flex min-h-[96px] flex-1 flex-col gap-1 text-xs">
          <PostHeader
            author={author}
            taggedPeople={taggedPeople}
            location={location}
          />

          <PostContent content={content} photoUrl={photoUrl} />

          <PostFooter
            postId={id}
            timestamp={timestamp}
            comments={comments}
            likes={likes}
            likedByVisitor={likedByVisitor}
            loading={loading}
            onToggleLike={handleToggleLike}
          />
        </div>
      </div>
    </div>
  );
}
