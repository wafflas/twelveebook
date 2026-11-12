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
    <div className="flex items-start gap-2 py-3">
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
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-xs">
        <div className="text-sm">
          <Link
            href={`/profile/${nameToSlug(author.name)}`}
            className="text-linkblue hover:text-linkblue/80"
          >
            {author.name}
          </Link>
        </div>
        <TextWithMentions text={text} className="break-words text-black" />
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
        <div className="text-timestampgray">
          {formatTimestampFor2012(timestamp)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
