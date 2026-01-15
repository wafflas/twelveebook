import React from "react";

interface ProfileInterestsProps {
  music?: string;
  movies?: string;
  quotes?: string;
}

export function ProfileInterests({
  music,
  movies,
  quotes,
}: ProfileInterestsProps) {
  if (!music && !movies && !quotes) {
    return null;
  }

  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <h3 className="mb-3 text-lg font-bold">Interests</h3>
      <div className="space-y-2 text-sm">
        {music && (
          <p>
            <span className="font-semibold">Music:</span> {music}
          </p>
        )}
        {movies && (
          <p>
            <span className="font-semibold">Favorite Movies:</span> {movies}
          </p>
        )}
        {quotes && (
          <p>
            <span className="font-semibold">Favorite Quotes:</span>{" "}
            <span className="italic">{quotes}</span>
          </p>
        )}
      </div>
    </div>
  );
}
