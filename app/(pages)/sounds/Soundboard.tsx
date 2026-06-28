"use client";

import { useRef } from "react";
import { klavika } from "@/app/fonts";

const PADS = [
  { note: "C", freq: 261.63 },
  { note: "D", freq: 293.66 },
  { note: "E", freq: 329.63 },
  { note: "F", freq: 349.23 },
  { note: "G", freq: 392.0 },
  { note: "A", freq: 440.0 },
  { note: "B", freq: 493.88 },
  { note: "C", freq: 523.25 },
];

export default function Soundboard() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = (freq: number) => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.62);
  };

  return (
    <div className="rounded-xl p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PADS.map((pad, i) => (
          <div key={`${pad.note}-${i}`} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => play(pad.freq)}
              aria-label={`Play note ${pad.note}`}
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
                className="relative grid h-full w-full place-items-center rounded-full transition-transform duration-75 group-active:translate-y-[2px] group-active:scale-[0.98]"
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
                <span
                  className={`${klavika.className} relative text-3xl font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]`}
                >
                  {pad.note}
                </span>
              </span>
            </button>
            <span className="mt-3 text-xs font-medium text-white/70">
              {Math.round(pad.freq)} Hz
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
