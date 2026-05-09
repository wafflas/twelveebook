"use client";

import { useEffect, useRef } from "react";
import "@/lib/dino/demos-scope.css";

export default function DinoRunner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const offlineResourcesRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/dino/audio-resources.fragment.html");
        if (!res.ok) {
          throw new Error(`Audio fragment: ${res.status}`);
        }
        const fragmentHtml = await res.text();
        const mount = offlineResourcesRef.current;
        if (cancelled || !mount) return;
        if (!mount.querySelector("#audio-resources")) {
          mount.insertAdjacentHTML("beforeend", fragmentHtml);
        }
        await import("../../lib/dino/index.js");
        if (cancelled || !window.Runner) return;
        runnerRef.current = new window.Runner("#dino-runner-interstitial");
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
      runnerRef.current?.destroy?.();
      runnerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label="T-Rex runner demo"
      className="dino-demo-root offline dino-demo-shell outline-none ring-brand focus-visible:ring-2"
    >
      <button
        type="button"
        id="details-button"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      >
        details
      </button>

      <div id="dino-runner-interstitial" className="interstitial-wrapper">
        <div id="main-content">
          <div className="icon icon-offline" />
        </div>
        <div id="offline-resources" ref={offlineResourcesRef}>
          {/* Runner reads these elements by id for canvas drawImage — keep plain <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- sprite DOM contract */}
          <img
            id="offline-resources-1x"
            alt=""
            src="/dino/default_100_percent/100-twelvee-sprite2.png"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- sprite DOM contract */}
          <img
            id="offline-resources-2x"
            alt=""
            src="/dino/default_200_percent/200-twelvee-sprite2.png"
          />
        </div>
      </div>
    </div>
  );
}
