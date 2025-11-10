"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import TextWithMentions from "@/components/TextWithMentions";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes?: number;
  replyCount?: number;
  replies?: {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    text: string;
    timestamp: string;
    likes?: number;
  }[];
}

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  commentsCount: number;
}

export default function CommentsSection({
  postId,
  comments,
  commentsCount,
}: CommentsSectionProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [showRepliesFor, setShowRepliesFor] = useState<Set<string>>(new Set());

  // Track likes for comments and replies
  const [commentLikes, setCommentLikes] = useState<
    Record<string, { likes: number; liked: boolean; loading: boolean }>
  >({});

  // Show only first 3 comments by default
  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  // Fetch like status for a comment or reply
  useEffect(() => {
    const allIds: string[] = [];
    comments.forEach((comment) => {
      allIds.push(comment.id);
      comment.replies?.forEach((reply) => allIds.push(reply.id));
    });

    allIds.forEach(async (id) => {
      try {
        const res = await fetch(`/api/comments/${id}/likes`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setCommentLikes((prev) => ({
            ...prev,
            [id]: {
              likes: data.likes ?? 0,
              liked: data.likedByVisitor ?? false,
              loading: false,
            },
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch likes for comment ${id}:`, error);
      }
    });
  }, [comments]);

  const toggleReplies = (commentId: string) => {
    setShowRepliesFor((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const toggleLike = async (commentId: string) => {
    const current = commentLikes[commentId];
    if (current?.loading) return;

    const action = current?.liked ? "unlike" : "like";

    // Optimistic update
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: {
        likes: Math.max(
          0,
          (prev[commentId]?.likes ?? 0) + (action === "like" ? 1 : -1),
        ),
        liked: !prev[commentId]?.liked,
        loading: true,
      },
    }));

    try {
      const res = await fetch(`/api/comments/${commentId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: {
          likes: data.likes ?? 0,
          liked: data.likedByVisitor ?? false,
          loading: false,
        },
      }));
    } catch (error) {
      // Revert on error
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: {
          likes: Math.max(
            0,
            (prev[commentId]?.likes ?? 0) + (action === "like" ? -1 : 1),
          ),
          liked: prev[commentId]?.liked,
          loading: false,
        },
      }));
    }
  };

  return (
    <div className="pt-4">
      {/* Comments count header */}
      {commentsCount > 0 && (
        <div className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">
          {commentsCount} {commentsCount === 1 ? "Comment" : "Comments"}
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <>
          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div key={comment.id}>
                {/* Main Comment */}
                <div className="flex gap-2">
                  <Link href={`/profile/${nameToSlug(comment.author.name)}`}>
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      width={40}
                      height={40}
                      className="rounded-sm object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="rounded px-3 py-2">
                      <div className="mb-1">
                        <Link
                          href={`/profile/${nameToSlug(comment.author.name)}`}
                          className="text-sm font-semibold text-linkblue hover:text-linkblue/80"
                        >
                          {comment.author.name}
                        </Link>
                      </div>
                      <TextWithMentions
                        text={comment.text}
                        className="break-words text-sm text-black"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        {formatTimestampFor2012(comment.timestamp)}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between px-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLike(comment.id)}
                          disabled={commentLikes[comment.id]?.loading}
                          className={`${commentLikes[comment.id]?.liked ? "text-linkblue" : "text-gray-600"} hover:text-linkblue`}
                        >
                          {commentLikes[comment.id]?.liked ? "Liked" : "Like"}
                        </button>
                        {commentLikes[comment.id]?.likes > 0 && (
                          <span className="text-gray-500">
                            {commentLikes[comment.id].likes}{" "}
                            {commentLikes[comment.id].likes === 1
                              ? "like"
                              : "likes"}
                          </span>
                        )}
                      </div>
                      {(comment.replyCount ?? 0) > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="text-linkblue hover:underline"
                        >
                          {showRepliesFor.has(comment.id)
                            ? "Hide replies"
                            : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {showRepliesFor.has(comment.id) &&
                  comment.replies &&
                  comment.replies.length > 0 && (
                    <div className="ml-12 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Link
                            href={`/profile/${nameToSlug(reply.author.name)}`}
                          >
                            <Image
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              width={32}
                              height={32}
                              className="rounded-sm object-cover"
                            />
                          </Link>
                          <div className="flex-1">
                            <div className="rounded px-2 py-1.5">
                              <div className="mb-0.5">
                                <Link
                                  href={`/profile/${nameToSlug(reply.author.name)}`}
                                  className="text-xs font-semibold text-linkblue hover:text-linkblue/80"
                                >
                                  {reply.author.name}
                                </Link>
                              </div>
                              <TextWithMentions
                                text={reply.text}
                                className="break-words text-xs text-black"
                              />
                              <div className="mt-1.5 text-[10px] text-gray-500">
                                {formatTimestampFor2012(reply.timestamp)}
                              </div>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 px-2 text-[10px]">
                              <button
                                onClick={() => toggleLike(reply.id)}
                                disabled={commentLikes[reply.id]?.loading}
                                className={`${commentLikes[reply.id]?.liked ? "text-linkblue" : "text-gray-600"} hover:text-linkblue`}
                              >
                                {commentLikes[reply.id]?.liked
                                  ? "Liked"
                                  : "Like"}
                              </button>
                              {commentLikes[reply.id]?.likes > 0 && (
                                <span className="text-gray-500">
                                  {commentLikes[reply.id].likes}{" "}
                                  {commentLikes[reply.id].likes === 1
                                    ? "like"
                                    : "likes"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Show more/less toggle */}
          {hasMoreComments && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="mt-3 text-sm text-linkblue hover:underline"
            >
              View all {commentsCount} comments
            </button>
          )}
          {showAllComments && hasMoreComments && (
            <button
              onClick={() => setShowAllComments(false)}
              className="mt-3 text-sm text-gray-600 hover:underline"
            >
              Show less
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">No comments yet.</p>
      )}
    </div>
  );
}
