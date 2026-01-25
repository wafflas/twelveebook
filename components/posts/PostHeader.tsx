import React, { memo } from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { TaggedPeople } from "./TaggedPeople";

interface PostHeaderProps {
  author: {
    name: string;
    avatar: string;
  };
  taggedPeople?: { name: string; avatar: string }[];
  location?: string;
}

export const PostHeader = memo(function PostHeader({
  author,
  taggedPeople = [],
  location,
}: PostHeaderProps) {
  return (
    <div className="text-sm">
      <Link
        href={`/profile/${nameToSlug(author.name)}`}
        className="text-linkblue hover:text-linkblue/80"
        prefetch={true}
      >
        {author.name}
      </Link>

      <TaggedPeople taggedPeople={taggedPeople} />

      {location && (
        <span className="text-gray-600">
          {" "}
          at <span className="font-semibold text-black">{location}</span>
        </span>
      )}
    </div>
  );
});
