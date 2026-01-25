"use client";

import React from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface TextWithMentionsProps {
  text: string;
  className?: string;
}

/**
 * Component that parses text and converts @mentions into clickable profile links
 **/
export function TextWithMentions({
  text,
  className = "",
}: TextWithMentionsProps) {
  // Regex to match @mentions (alphanumeric and underscores)
  const mentionRegex = /@(\w+)/g;
  const parts: { type: "text" | "mention"; content: string; name?: string }[] =
    [];
  let lastIndex = 0;
  let match;

  // Parse the text and split into text/mention parts
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    // Add mention
    parts.push({
      type: "mention",
      content: match[0], // Full match including @
      name: match[1], // Captured group (name without @)
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.type === "mention" ? (
          <Link
            key={idx}
            href={`/profile/${nameToSlug(part.name!)}`}
            className="font-semibold text-linkblue/80 hover:text-linkblue/80"
            prefetch={true}
          >
            {part.name}
          </Link>
        ) : (
          <span key={idx}>{part.content}</span>
        ),
      )}
    </span>
  );
}
