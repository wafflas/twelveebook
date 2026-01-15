import React from "react";
import Image from "next/image";
import { klavika } from "@/app/fonts";

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
}

export function ProfileHeader({ name, avatarUrl }: ProfileHeaderProps) {
  return (
    <Image
      src={avatarUrl}
      alt={name}
      width={180}
      height={180}
      className="object-cover"
    />
  );
}
