"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { klavika } from "@/app/fonts";
import { nameToSlug } from "@/lib/utils";
import { Profile as ProfileType } from "@/types/Profile";

interface Friend {
  name: string;
  avatarUrl: string;
}

interface WallPost {
  author: string;
  content: string;
  timestamp: string;
  isPhoto?: boolean;
  taggedPeople?: { name: string }[];
  location?: string;
}

interface ProfileProps {
  profile: ProfileType;
  wallPosts?: WallPost[];
  friends?: Friend[];
}

export default function Profile({
  profile,
  wallPosts = [],
  friends = [],
}: ProfileProps) {
  const [expandedPosts, setExpandedPosts] = React.useState<Set<number>>(
    new Set(),
  );

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

  const firstName = profile.name.split(" ")[0];
  const profileName = profile.name;
  const profilePictureUrl = profile.avatar;
  const birthday = profile.birthday || "October 12, 2003";
  const city = profile.city || "";
  const relationshipStatus = profile.relationshipStatus || "";
  const education = profile.education || "";
  const work = profile.work || "";
  const musicInterests = profile.music || "";
  const favoriteMovies = profile.movies || "";
  const favoriteQuotes = profile.quotes || "";

  // Use friends from profile if not passed as prop
  const displayFriends = friends.length > 0 ? friends : profile.friends || [];
  const isOwner = nameToSlug(profileName).toLowerCase() === "twelvee";
  return (
    <div className="bg-white p-2 text-black">
      {/* Profile Header */}
      <div className="mb-6 flex gap-6">
        {/* Profile Picture - Left Side */}
        <div className="flex-shrink-0">
          <Image
            src={profilePictureUrl}
            alt={profileName}
            width={180}
            height={180}
            className="object-cover"
          />
        </div>

        {/* Profile Name - Next to Picture */}
        <div className="flex flex-col justify-center">
          <h1 className={`text-2xl font-bold ${klavika.className}`}>
            {profileName}
          </h1>

          {/* Action Links */}
          <div className="space-y-3 pt-4">
            {isOwner ? (
              <>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  Edit Profile
                </Link>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  Change Profile Picture
                </Link>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  Privacy Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  Send Message to {firstName}
                </Link>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  View Photos of {firstName}(25)
                </Link>
                <Link
                  href="#"
                  className="block text-[10px] text-linkblue hover:text-linkblue/80"
                >
                  View Friends of {firstName}({displayFriends.length})
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Section: Profile Info */}
      <div className="mb-6 space-y-6">
        {/* Information Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="mb-3 text-lg font-bold">Information</h3>
          <div className="space-y-2 text-sm">
            {birthday && (
              <p>
                <span className="font-semibold">Birthday:</span> {birthday}
              </p>
            )}
            {city && (
              <p>
                <span className="font-semibold">City:</span> {city}
              </p>
            )}
            {relationshipStatus && (
              <p>
                <span className="font-semibold">Relationship:</span>{" "}
                {relationshipStatus}
              </p>
            )}
          </div>
        </div>

        {/* Education Section */}
        {education && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-3 text-lg font-bold">Education</h3>
            <p className="text-sm">{education}</p>
          </div>
        )}

        {/* Work Section */}
        {work && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-3 text-lg font-bold">Work</h3>
            <p className="text-sm">{work}</p>
          </div>
        )}

        {/* Interests Section */}
        {(musicInterests || favoriteMovies || favoriteQuotes) && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-3 text-lg font-bold">Interests</h3>
            <div className="space-y-2 text-sm">
              {musicInterests && (
                <p>
                  <span className="font-semibold">Music:</span>{" "}
                  {musicInterests}
                </p>
              )}
              {favoriteMovies && (
                <p>
                  <span className="font-semibold">Favorite Movies:</span>{" "}
                  {favoriteMovies}
                </p>
              )}
              {favoriteQuotes && (
                <p>
                  <span className="font-semibold">Favorite Quotes:</span>{" "}
                  <span className="italic">{favoriteQuotes}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wall Section - Full Width */}
      {wallPosts.length > 0 && (
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
                              >
                                {person.name}
                              </Link>
                              {idx < taggedPeople.length - 1 &&
                                (idx === taggedPeople.length - 2
                                  ? " and "
                                  : ", ")}
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
                  <p className="mt-1 text-xs text-gray-500">
                    {post.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends Section */}
      {displayFriends.length > 0 && (
        <div className="border-gray-200 pt-6">
          <h3 className="text-lg font-bold">
            Friends({displayFriends.length})
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {displayFriends.map((friend, index) => (
              <Link href={`/profile/${nameToSlug(friend.name)}`} key={index}>
                <div className="w-fit items-center text-center transition-opacity hover:opacity-80">
                  <Image
                    src={friend.avatarUrl}
                    alt={friend.name}
                    width={88}
                    height={88}
                    className="items-center object-cover pt-2"
                  />
                  <p className="text-sm font-semibold">{friend.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
