import React, { memo } from "react";
import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
}

export const ProfileHeader = memo(function ProfileHeader({
  name,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <Image
      src={avatarUrl}
      alt={`${name}'s profile picture`}
      width={180}
      height={180}
      sizes="180px"
      className="object-cover"
      priority
    />
  );
});
