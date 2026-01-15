"use client";

import React, { useState, useEffect } from "react";
import { useLikeSound } from "@/lib/useLikeSound";
import { Comment } from "./Comment";

interface CommentData {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes?: number;
  replyCount?: number;
  photoUrl?: string;
  replies?: {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    text: string;
    timestamp: string;
    likes?: number;
    photoUrl?: string;
  }[];
}

interface CommentsListProps {
  postId: string;
  comments: CommentData[];
  commentsCount: number;
}

export function CommentsList({
  comments,
  commentsCount,
}: CommentsListProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [showRepliesFor, setShowRepliesFor] = useState<Set<string>>(new Set());
  const { playLikeSound } = useLikeSound();

  const [commentLikes, setCommentLikes] = useState<
    Record<string, { likes: number; liked: boolean; loading: boolean }>
  >({});

  // show only first 3 comments by default
  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

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

    // Play sound immediately for instant feedback
    playLikeSound();

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

  const getCommentLikeState = (commentId: string) => {
    return (
      commentLikes[commentId] ?? { likes: 0, liked: false, loading: false }
    );
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
            {displayedComments.map((comment) => {
              const commentLikeState = getCommentLikeState(comment.id);
              return (
                <Comment
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  text={comment.text}
                  timestamp={comment.timestamp}
                  photoUrl={comment.photoUrl}
                  replyCount={comment.replyCount}
                  replies={comment.replies}
                  showReplies={showRepliesFor.has(comment.id)}
                  likes={commentLikeState.likes}
                  liked={commentLikeState.liked}
                  loading={commentLikeState.loading}
                  onToggleLike={() => toggleLike(comment.id)}
                  onToggleReplies={() => toggleReplies(comment.id)}
                  getReplyLikeState={getCommentLikeState}
                  onToggleReplyLike={toggleLike}
                />
              );
            })}
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
