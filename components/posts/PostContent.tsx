import React from "react";
import Image from "next/image";
import { TextWithMentions } from "@/components/shared/TextWithMentions";

interface PostContentProps {
  content: string;
  photoUrl?: string;
}

export function PostContent({ content, photoUrl }: PostContentProps) {
  return (
    <>
      <TextWithMentions text={content} className="break-words" />

      {photoUrl && (
        <div className="mt-2">
          <Image
            src={photoUrl}
            alt="Post photo"
            width={300}
            height={200}
            className="max-w-full object-cover"
          />
        </div>
      )}
    </>
  );
}
