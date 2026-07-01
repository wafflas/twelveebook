"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameDemo } from "@/types/GameDemo";
import { getUnlockedDemoIds, unlockDemoId } from "@/lib/demos/session";
import DemoUnlockPanel from "./DemoUnlockPanel";
import DemoUnlockToast from "./DemoUnlockToast";
import DinoPlayHint from "./DinoPlayHint";
import "@/lib/dino/demos-scope.css";

interface DinoRunnerProps {
  demos: GameDemo[];
}

interface DemoUnlockDetail {
  demo: Pick<GameDemo, "id" | "title" | "unlockScore">;
  displayScore: number;
}

export default function DinoRunner({ demos }: DinoRunnerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const offlineResourcesRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<{ destroy: () => void } | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPlayHint, setShowPlayHint] = useState(true);

  const runnerDemos = useMemo(
    () =>
      demos.map((demo) => ({
        id: demo.id,
        title: demo.title,
        unlockScore: demo.unlockScore,
      })),
    [demos],
  );

  const unlockedDemos = useMemo(
    () => demos.filter((demo) => unlockedIds.includes(demo.id)),
    [demos, unlockedIds],
  );

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  useEffect(() => {
    setUnlockedIds(getUnlockedDemoIds());
  }, []);

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
        runnerRef.current = new window.Runner("#dino-runner-interstitial", {
          demoUnlocks: runnerDemos,
        });
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
      runnerRef.current?.destroy?.();
      runnerRef.current = null;
    };
  }, [runnerDemos]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const onDemoUnlocked = (event: Event) => {
      const { demo } = (event as CustomEvent<DemoUnlockDetail>).detail;
      const alreadyUnlocked = getUnlockedDemoIds().includes(demo.id);
      const ids = unlockDemoId(demo.id);
      setUnlockedIds(ids);
      if (!alreadyUnlocked) {
        setToastMessage(`You unlocked "${demo.title}"!`);
      }
    };

    const onPlayStart = () => {
      setShowPlayHint(false);
    };

    root.addEventListener("dino:demo-unlocked", onDemoUnlocked);
    root.addEventListener("dino:play-start", onPlayStart);

    return () => {
      root.removeEventListener("dino:demo-unlocked", onDemoUnlocked);
      root.removeEventListener("dino:play-start", onPlayStart);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={rootRef}
        tabIndex={0}
        role="application"
        aria-label="T-Rex runner demo"
        className="dino-demo-root offline relative h-[min(55vh,520px)] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <DemoUnlockToast message={toastMessage} onDismiss={dismissToast} />
        <DinoPlayHint visible={showPlayHint} />

        <button
          type="button"
          id="details-button"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        >
          details
        </button>

        <div
          id="dino-runner-interstitial"
          className="interstitial-wrapper h-full min-h-[260px] sm:min-h-0"
        >
          <div id="main-content">
            <div className="icon icon-offline" />
          </div>
          <div id="offline-resources" ref={offlineResourcesRef}>
            {/* Runner reads these elements by id for canvas drawImage — keep plain <img>. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- sprite DOM contract */}
            <img
              id="offline-resources-1x"
              alt=""
              src="/dino/default_100_percent/100-twelvee-sprite4.png"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- sprite DOM contract */}
            <img
              id="offline-resources-2x"
              alt=""
              src="/dino/default_200_percent/200-twelvee-sprite4.png"
            />
          </div>
        </div>
      </div>

      {unlockedDemos.length > 0 ? (
        <DemoUnlockPanel demos={unlockedDemos} />
      ) : null}
    </div>
  );
}
