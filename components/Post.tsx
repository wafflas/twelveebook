"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import TextWithMentions from "@/components/TextWithMentions";
import { useLikeSound } from "@/lib/useLikeSound";
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
  taggedPeople?: { name: string; avatar: string }[];
  location?: string;
  photoUrl?: string;
  commentsData?: {
    id: string;
    author: { name: string; avatar: string };
    text: string;
    timestamp: string;
    replyCount?: number;
    photoUrl?: string;
    replies?: {
      id: string;
      author: { name: string; avatar: string };
      text: string;
      timestamp: string;
      photoUrl?: string;
    }[];
  }[];
}

export default function Post({
  id,
  author,
  title = "",
  content,
  timestamp,
  likes: initialLikes,
  comments = 0,
  taggedPeople = [],
  location,
  photoUrl,
  commentsData = [],
}: PostProps) {
  const [likes, setLikes] = useState<number>(initialLikes ?? 0);
  const [likedByVisitor, setLikedByVisitor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAllTags, setShowAllTags] = useState<boolean>(false);
  const { playLikeSound } = useLikeSound();

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

  async function toggleLike(e: React.MouseEvent<HTMLButtonElement>) {
    if (loading) return;

    e.currentTarget.blur();

    setLoading(true);
    const action = likedByVisitor ? "unlike" : "like";

    playLikeSound();

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
    <div className="bg-white">
      <div className="flex flex-row items-start gap-2 py-3">
        <Link href={`/profile/${nameToSlug(author.name)}`}>
          <Image src={author.avatar} alt={author.name} width={96} height={96} />
        </Link>

        <div className="flex min-h-[96px] flex-1 flex-col gap-1 text-xs">
          {/* Author, Tagged People, and Location in one row */}
          <div className="text-sm">
            <Link
              href={`/profile/${nameToSlug(author.name)}`}
              className="text-linkblue hover:text-linkblue/80"
            >
              {author.name}
            </Link>

            {/* Tagged People */}
            {taggedPeople && taggedPeople.length > 0 && (
              <span className="text-gray-600">
                {" "}
                with{" "}
                {taggedPeople.length <= 2 ? (
                  // Show all if 2 or fewer
                  taggedPeople.map((person, idx) => (
                    <span key={idx}>
                      <Link
                        href={`/profile/${nameToSlug(person.name)}`}
                        className="text-linkblue hover:text-linkblue/80"
                      >
                        {person.name}
                      </Link>
                      {idx < taggedPeople.length - 1 &&
                        (idx === taggedPeople.length - 2 ? " and " : ", ")}
                    </span>
                  ))
                ) : showAllTags ? (
                  // Show all when expanded
                  taggedPeople.map((person, idx) => (
                    <span key={idx}>
                      <Link
                        href={`/profile/${nameToSlug(person.name)}`}
                        className="text-linkblue hover:text-linkblue/80"
                      >
                        {person.name}
                      </Link>
                      {idx < taggedPeople.length - 1 && ", "}
                    </span>
                  ))
                ) : (
                  // Show first + "X more" when collapsed
                  <>
                    <Link
                      href={`/profile/${nameToSlug(taggedPeople[0].name)}`}
                      className="text-linkblue hover:text-linkblue/80"
                    >
                      {taggedPeople[0].name}
                    </Link>
                    {" and "}
                    <button
                      onClick={() => setShowAllTags(true)}
                      className="text-linkblue hover:text-linkblue/80"
                    >
                      +{taggedPeople.length - 1} more
                    </button>
                  </>
                )}
              </span>
            )}

            {/* Location */}
            {location && (
              <span className="text-gray-600">
                {" "}
                at <span className="font-semibold text-black">{location}</span>
              </span>
            )}
          </div>

          <TextWithMentions text={content} className="break-words" />

          {/* Display photo if present */}
          {photoUrl && (
            <div className="mt-2">
              <Image
                src={photoUrl}
                alt="Post photo"
                width={300}
                height={200}
                className="max-w-full rounded object-cover"
              />
            </div>
          )}

          <p className="text-s text-timestampgray">
            {formatTimestampFor2012(timestamp)}
          </p>
          <div className="text-s mt-auto flex flex-col">
            <div className="flex flex-row items-center gap-1">
              <Link
                href={`/post/${id}`}
                className="text-black hover:text-linkblue/80"
              >
                {comments} {comments === 1 ? "comment" : "comments"}
              </Link>
              {" · "}
              <button
                onClick={toggleLike}
                disabled={loading}
                className={` ${likedByVisitor ? "text-linkblue" : "text-black"} hover:text-linkblue/80`}
                aria-pressed={likedByVisitor}
              >
                {likedByVisitor ? "Liked" : "Like"}
              </button>
            </div>
            <p>{likes} people like this.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
