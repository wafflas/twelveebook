"use client";
import React, { useState } from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface TaggedPeopleProps {
  taggedPeople: { name: string; avatar: string }[];
}

export function TaggedPeople({ taggedPeople }: TaggedPeopleProps) {
  const [showAllTags, setShowAllTags] = useState<boolean>(false);

  if (!taggedPeople || taggedPeople.length === 0) {
    return null;
  }

  return (
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
  );
}
