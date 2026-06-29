"use client";

import { useRef, useState } from "react";
import type { GameDemo } from "@/types/GameDemo";

interface DemoUnlockPanelProps {
  demos: GameDemo[];
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
    >
      <path
        d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
    >
      <path
        d="M8 5V19M16 5V19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DemoUnlockPanel({ demos }: DemoUnlockPanelProps) {
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stop = (id: string) => {
    const audio = audioCacheRef.current.get(id);
    audio?.pause();
    setPlayingId(null);
  };

  const toggle = (demo: GameDemo) => {
    if (playingId === demo.id) {
      stop(demo.id);
      return;
    }

    if (playingId) {
      stop(playingId);
    }

    let audio = audioCacheRef.current.get(demo.id);
    if (!audio) {
      audio = new Audio(demo.audioUrl);
      audio.volume = 0.9;
      audioCacheRef.current.set(demo.id, audio);
      audio.addEventListener("ended", () => {
        setPlayingId((current) => (current === demo.id ? null : current));
      });
    }

    audio.currentTime = 0;
    setPlayingId(demo.id);
    void audio.play().catch((error) => {
      console.debug("Could not play demo:", error);
      setPlayingId(null);
    });
  };

  if (!demos.length) {
    return null;
  }

  return (
    <div role="region" aria-label="Unlocked demos">
      <h2 className="mb-1 text-lg font-bold">Unlocked demos</h2>
      <ul className="m-0 list-none border-t border-gray-200 p-0">
        {demos.map((demo) => {
          const isPlaying = playingId === demo.id;

          return (
            <li
              key={demo.id}
              className="flex items-center justify-between gap-2 border-b border-gray-200 py-2 text-sm text-black"
            >
              <span className="font-bold">{demo.title}</span>
              <button
                type="button"
                className="inline-flex items-center"
                aria-label={
                  isPlaying ? `Stop ${demo.title}` : `Play ${demo.title}`
                }
                onClick={() => toggle(demo)}
              >
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    Stop <StopIcon />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    Play <PlayIcon />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
