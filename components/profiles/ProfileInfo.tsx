import React from "react";

interface ProfileInfoProps {
  birthday?: string;
  city?: string;
  relationshipStatus?: string;
  education?: string;
  work?: string;
}

export function ProfileInfo({
  birthday,
  city,
  relationshipStatus,
  education,
  work,
}: ProfileInfoProps) {
  return (
    <div className="mb-6 space-y-6">
      {/* Information Section */}
      {(birthday || city || relationshipStatus) && (
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
      )}

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
    </div>
  );
}
