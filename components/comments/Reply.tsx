import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { TextWithMentions } from "@/components/shared/TextWithMentions";

interface ReplyProps {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  photoUrl?: string;
  likes: number;
  liked: boolean;
  loading: boolean;
  onToggleLike: () => void;
}

export function Reply({
  author,
  text,
  timestamp,
  photoUrl,
  likes,
  liked,
  loading,
  onToggleLike,
}: ReplyProps) {
  return (
    <div className="flex gap-2">
      <Link href={`/profile/${nameToSlug(author.name)}`} prefetch={true}>
        <Image
          src={author.avatar}
          alt={`${author.name}'s avatar`}
          width={40}
          height={40}
          sizes="40px"
          className="aspect-square h-[40px] w-[40px] min-w-[40px] shrink-0 object-cover"
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
                alt="Reply photo"
                width={200}
                height={200}
                sizes="(max-width: 768px) 100vw, 200px"
                className="aspect-square max-w-full rounded object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {formatTimestampFor2012(timestamp)}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 px-3 text-xs">
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
      </div>
    </div>
  );
}
