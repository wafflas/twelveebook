"use client";

import { useRef } from "react";
import type { SoundPad } from "@/types/Soundboard";

interface SoundboardProps {
  pads: SoundPad[];
}

export default function Soundboard({ pads }: SoundboardProps) {
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = (url: string) => {
    let audio = audioCacheRef.current.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.volume = 0.8;
      audioCacheRef.current.set(url, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch((error) => {
      console.debug("Could not play sound:", error);
    });
  };

  return (
    <div className="rounded-xl p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pads.map((pad) => (
          <div key={pad.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => play(pad.audioUrl)}
              aria-label="Play sound"
              className="group grid aspect-square w-full max-w-[120px] place-items-center rounded-full"
              style={{
                padding: "9px",
                background:
                  "radial-gradient(circle at 50% 120%, #3a3f4d 0%, #11141b 72%)",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.06), inset 0 -3px 8px rgba(0,0,0,0.7), 0 5px 10px rgba(0,0,0,0.45)",
              }}
            >
              <span
                className="relative h-full w-full rounded-full transition-transform duration-75 group-active:translate-y-[2px] group-active:scale-[0.98]"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, #ffd489 0%, #f6a83f 22%, #f3860b 52%, #a85607 100%)",
                  boxShadow:
                    "0 7px 14px rgba(0,0,0,0.5), inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -12px 20px rgba(120,55,0,0.55)",
                }}
              >
                <span
                  className="pointer-events-none absolute left-1/2 top-[9%] h-[40%] w-[68%] -translate-x-1/2 rounded-[50%] opacity-90 transition-opacity group-active:opacity-60"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
                  }}
                />
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
