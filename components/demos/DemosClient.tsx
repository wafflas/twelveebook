"use client";
import React, { useEffect, useState } from "react";
import { DinoGame } from "./DinoGame";

export function DemosClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isUnlocked = localStorage.getItem("demosUnlocked") === "true";
    setUnlocked(isUnlocked);
  }, []);

  const handleUnlock = () => {
    localStorage.setItem("demosUnlocked", "true");
    setUnlocked(true);
  };

  const handleReset = () => {
    localStorage.removeItem("demosUnlocked");
    setUnlocked(false);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-white">
        <DinoGame onUnlock={handleUnlock} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Demos Unlocked</h1>
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Play Game Again
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Demo Track 1 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Track 1 - Demo Title</h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track1.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Demo Track 2 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              Track 2 - Another Demo
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track2.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Demo Track 3 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Track 3 - Fresh Beat</h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track3.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Demo Track 4 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Track 4 - New Wave</h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track4.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Demo Track 5 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Track 5 - Exclusive</h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track5.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Demo Track 6 */}
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Track 6 - Bonus</h3>
            <p className="mb-4 text-sm text-gray-600">
              Artist: 2012 Collective
            </p>
            <audio controls className="w-full">
              <source src="/demos/track6.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </div>
    </div>
  );
}
