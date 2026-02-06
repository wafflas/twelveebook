"use client";
import React from "react";

interface CommentActionsProps {
  likes: number;
  liked: boolean;
  loading: boolean;
  replyCount?: number;
  showReplies?: boolean;
  onToggleLike: () => void;
  onToggleReplies?: () => void;
}

export function CommentActions({
  likes,
  liked,
  loading,
  replyCount = 0,
  showReplies = false,
  onToggleLike,
  onToggleReplies,
}: CommentActionsProps) {
  return (
    <div className="mt-1 flex items-center justify-between px-3 text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLike}
          disabled={loading}
          className={`${liked ? "text-linkblue hover:text-linkblue/80" : "text-linkblue/80 hover:text-linkblue"} `}
        >
          {liked ? "Liked <3" : "Like"}
        </button>
        {likes > 0 && (
          <span className="text-gray-500">
            {likes} {likes === 1 ? "like" : "likes"}
          </span>
        )}
      </div>
      {replyCount > 0 && onToggleReplies && (
        <button onClick={onToggleReplies} className="text-linkblue hover:underline">
          {showReplies
            ? "Hide replies"
            : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
        </button>
      )}
    </div>
  );
}
