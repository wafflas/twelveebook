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
          width={32}
          height={32}
          sizes="32px"
          className="object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex-1">
        <div className="rounded px-2 py-1.5">
          <div className="mb-0.5">
            <Link
              href={`/profile/${nameToSlug(author.name)}`}
              className="text-xs font-semibold text-linkblue hover:text-linkblue/80"
            >
              {author.name}
            </Link>
          </div>
          <TextWithMentions
            text={text}
            className="break-words text-xs text-black"
          />
          {photoUrl && (
            <div className="mt-1.5">
              <Image
                src={photoUrl}
                alt="Reply photo"
                width={150}
                height={100}
                sizes="(max-width: 768px) 100vw, 150px"
                className="max-w-full rounded object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="mt-1.5 text-[10px] text-gray-500">
            {formatTimestampFor2012(timestamp)}
          </div>
        </div>
        <div className="mt-0.5 flex items-center gap-2 px-2 text-[10px]">
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
