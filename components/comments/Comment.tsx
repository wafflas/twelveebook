import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { TextWithMentions } from "@/components/shared/TextWithMentions";
import { CommentActions } from "./CommentActions";
import { Reply } from "./Reply";

interface CommentReply {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  photoUrl?: string;
}

interface CommentProps {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  photoUrl?: string;
  replyCount?: number;
  replies?: CommentReply[];
  showReplies: boolean;
  likes: number;
  liked: boolean;
  loading: boolean;
  onToggleLike: () => void;
  onToggleReplies: () => void;
  getReplyLikeState: (replyId: string) => {
    likes: number;
    liked: boolean;
    loading: boolean;
  };
  onToggleReplyLike: (replyId: string) => void;
}

export function Comment({
  author,
  text,
  timestamp,
  photoUrl,
  replyCount = 0,
  replies = [],
  showReplies,
  likes,
  liked,
  loading,
  onToggleLike,
  onToggleReplies,
  getReplyLikeState,
  onToggleReplyLike,
}: CommentProps) {
  return (
    <div>
      <div className="flex gap-2">
        <Link href={`/profile/${nameToSlug(author.name)}`} prefetch={true}>
          <Image
            src={author.avatar}
            alt={`${author.name}'s avatar`}
            width={40}
            height={40}
            sizes="40px"
            className="object-cover"
            loading="lazy"
          />
        </Link>
        <div className="flex-1">
          <div className="rounded px-3 py-2">
            <div className="mb-1">
              <Link
                href={`/profile/${nameToSlug(author.name)}`}
                className="text-sm font-semibold text-linkblue hover:text-linkblue/80"
              >
                {author.name}
              </Link>
            </div>
            <TextWithMentions
              text={text}
              className="break-words text-sm text-black"
            />
            {photoUrl && (
              <div className="mt-2">
                <Image
                  src={photoUrl}
                  alt="Comment photo"
                  width={200}
                  height={150}
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="max-w-full rounded object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {formatTimestampFor2012(timestamp)}
            </div>
          </div>
          <CommentActions
            likes={likes}
            liked={liked}
            loading={loading}
            replyCount={replyCount}
            showReplies={showReplies}
            onToggleLike={onToggleLike}
            onToggleReplies={onToggleReplies}
          />
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="ml-12 mt-2 space-y-2">
          {replies.map((reply) => {
            const replyLikeState = getReplyLikeState(reply.id);
            return (
              <Reply
                key={reply.id}
                id={reply.id}
                author={reply.author}
                text={reply.text}
                timestamp={reply.timestamp}
                photoUrl={reply.photoUrl}
                likes={replyLikeState.likes}
                liked={replyLikeState.liked}
                loading={replyLikeState.loading}
                onToggleLike={() => onToggleReplyLike(reply.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
