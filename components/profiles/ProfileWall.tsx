"use client";
import React, { useState } from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface WallPost {
  author: string;
  content: string;
  timestamp: string;
  isPhoto?: boolean;
  taggedPeople?: { name: string }[];
  location?: string;
}

interface ProfileWallProps {
  wallPosts: WallPost[];
}

export function ProfileWall({ wallPosts }: ProfileWallProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

  const toggleTagExpansion = (postIndex: number) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postIndex)) {
        newSet.delete(postIndex);
      } else {
        newSet.add(postIndex);
      }
      return newSet;
    });
  };

  if (wallPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <h3 className="mb-3 text-lg font-bold">Wall</h3>
      <div className="space-y-4">
        {wallPosts.map((post, index) => {
          const showAllTags = expandedPosts.has(index);
          const taggedPeople = post.taggedPeople || [];

          return (
            <div
              key={index}
              className="border-b border-gray-100 pb-3 last:border-0"
            >
              <div className="mb-1 text-sm">
                <Link
                  href={`/profile/${nameToSlug(post.author)}`}
                  className="font-semibold text-linkblue hover:text-linkblue/80"
                  prefetch={true}
                >
                  {post.author}
                </Link>

                {/* Tagged People */}
                {taggedPeople.length > 0 && (
                  <span className="text-gray-600">
                    {" "}
                    with{" "}
                    {taggedPeople.length <= 2 ? (
                      taggedPeople.map((person, idx) => (
                        <span key={idx}>
                          <Link
                            href={`/profile/${nameToSlug(person.name)}`}
                            className="text-linkblue hover:text-linkblue/80"
                            prefetch={true}
                          >
                            {person.name}
                          </Link>
                          {idx < taggedPeople.length - 1 &&
                            (idx === taggedPeople.length - 2 ? " and " : ", ")}
                        </span>
                      ))
                    ) : showAllTags ? (
                      taggedPeople.map((person, idx) => (
                        <span key={idx}>
                          <Link
                            href={`/profile/${nameToSlug(person.name)}`}
                            className="text-linkblue hover:text-linkblue/80"
                            prefetch={true}
                          >
                            {person.name}
                          </Link>
                          {idx < taggedPeople.length - 1 && ", "}
                        </span>
                      ))
                    ) : (
                      <>
                        <Link
                          href={`/profile/${nameToSlug(taggedPeople[0].name)}`}
                          className="text-linkblue hover:text-linkblue/80"
                        >
                          {taggedPeople[0].name}
                        </Link>
                        {" and "}
                        <button
                          onClick={() => toggleTagExpansion(index)}
                          className="text-linkblue hover:text-linkblue/80"
                        >
                          +{taggedPeople.length - 1} more
                        </button>
                      </>
                    )}
                  </span>
                )}

                {/* Location */}
                {post.location && (
                  <span className="text-gray-600">
                    {" "}
                    at{" "}
                    <span className="font-semibold text-black">
                      {post.location}
                    </span>
                  </span>
                )}

                <span>: {post.content}</span>
              </div>

              {post.isPhoto && (
                <Link
                  href="#"
                  className="text-xs text-linkblue underline hover:text-linkblue/80"
                >
                  Photo
                </Link>
              )}
              <p className="mt-1 text-xs text-gray-500">{post.timestamp}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
