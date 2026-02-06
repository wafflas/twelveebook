"use client";
import React from "react";
import Link from "next/link";
import { formatTimestampFor2012 } from "@/lib/utils";

interface PostFooterProps {
  postId: string;
  timestamp: string;
  comments: number;
  likes: number;
  likedByVisitor: boolean;
  loading: boolean;
  onToggleLike: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function PostFooter({
  postId,
  timestamp,
  comments,
  likes,
  likedByVisitor,
  loading,
  onToggleLike,
}: PostFooterProps) {
  return (
    <>
      <p className="text-s text-timestampgray">
        {formatTimestampFor2012(timestamp)}
      </p>
      <div className="text-s mt-auto flex flex-col">
        <div className="flex flex-row items-center gap-1">
          <Link
            href={`/post/${postId}`}
            className={`${likedByVisitor ? "text-linkblue hover:text-linkblue/80" : "text-linkblue/80 hover:text-linkblue"} `}
          >
            {comments} {comments === 1 ? "comment" : "comments"}
          </Link>
          {" · "}
          <button
            onClick={onToggleLike}
            disabled={loading}
            className={`${likedByVisitor ? "text-linkblue hover:text-linkblue/80" : "text-linkblue/80 hover:text-linkblue"} `}
            aria-pressed={likedByVisitor}
          >
            {likedByVisitor ? "Liked <3" : "Like"}
          </button>
        </div>
        <p>{likes} people like this.</p>
      </div>
    </>
  );
}
