"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  qualifies,
  validNickname,
  type LeaderboardEntry,
} from "@/lib/dino/leaderboard/shared";

interface PendingScore {
  score: number;
  token: string;
}

async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/dino/${path}`, {
    method,
    credentials: "same-origin",
    ...(method !== "GET"
      ? { headers: { "Content-Type": "application/json" } }
      : {}),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || "The leaderboard is temporarily unavailable.",
    );
  return data as T;
}

export default function DinoLeaderboard({
  gameRoot,
}: {
  gameRoot: RefObject<HTMLDivElement | null>;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [pending, setPending] = useState<PendingScore | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const joinedRef = useRef(false);
  const enabledRef = useRef(false);
  const readyRef = useRef<Promise<void>>(Promise.resolve());
  const sessionRef = useRef<Promise<unknown> | null>(null);
  const entriesRef = useRef<LeaderboardEntry[]>([]);
  const bestRef = useRef(0);
  const generation = useRef(0);
  const runActive = useRef(false);
  const mounted = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const game = gameRoot.current;
    if (!pending || !enabled || !dialog) return;
    dialog.showModal();
    nicknameRef.current?.focus();
    return () => {
      dialog.close();
      game?.focus({ preventScroll: true });
    };
  }, [pending, enabled, gameRoot]);

  const updateEntries = (next: LeaderboardEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  };

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    readyRef.current = Promise.all([
      api<{ enabled: boolean; entries: LeaderboardEntry[] }>("leaderboard"),
      api<{
        joined: boolean;
        remember?: boolean;
        nickname?: string;
        best?: number;
      }>("session"),
    ])
      .then(([board, session]) => {
        if (cancelled) return;
        enabledRef.current = board.enabled;
        setEnabled(board.enabled);
        entriesRef.current = board.entries;
        setEntries(board.entries);
        joinedRef.current = session.joined;
        setNickname(session.nickname ?? "");
        bestRef.current = session.best ?? 0;
      })
      .catch(() => {
        if (!cancelled)
          setMessage(
            "The leaderboard is unavailable. You can still play and save your HI.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const root = gameRoot.current;
    if (!root) return;
    let disposed = false;
    let run: Promise<string | null> | null = null;
    const start = () => {
      runActive.current = true;
      const current = ++generation.current;
      setPending(null);
      run = null;
      setMessage("");
      // Register on play, not page load. Reuse a session-only identity.
      run = readyRef.current
        .then(async () => {
          if (disposed || current !== generation.current || !enabledRef.current)
            return null;
          if (!joinedRef.current) {
            sessionRef.current ??= api("session", "POST", { remember: false })
              .then(() => {
                joinedRef.current = true;
              })
              .finally(() => {
                sessionRef.current = null;
              });
            await sessionRef.current;
          }
          if (disposed || current !== generation.current) return null;
          const { token } = await api<{ token: string }>("run", "POST", {});
          return token;
        })
        .catch((error: unknown) => {
          if (!disposed && mounted.current && generation.current === current) {
            setMessage(
              error instanceof Error
                ? error.message
                : "This score cannot be submitted. Your HI still saves.",
            );
          }
          return null;
        });
    };
    const onPlay = () => {
      if (!runActive.current) start();
    };
    const finish = (event: Event) => {
      runActive.current = false;
      const { displayScore: score } = (
        event as CustomEvent<{ displayScore: number }>
      ).detail;
      const current = generation.current;
      const registeredRun = run;
      if (
        !registeredRun ||
        !Number.isSafeInteger(score) ||
        score <= bestRef.current ||
        !qualifies(score, entriesRef.current)
      )
        return;
      void registeredRun.then((token) => {
        if (
          !disposed &&
          mounted.current &&
          current === generation.current &&
          token &&
          joinedRef.current
        ) {
          setPending({ score, token });
        }
      });
    };
    root.addEventListener("dino:play-start", onPlay);
    root.addEventListener("dino:restart", start);
    root.addEventListener("dino:game-over", finish);
    return () => {
      disposed = true;
      root.removeEventListener("dino:play-start", onPlay);
      root.removeEventListener("dino:restart", start);
      root.removeEventListener("dino:game-over", finish);
    };
  }, [gameRoot]);

  async function submit() {
    if (!pending) return;
    const trimmed = nickname.trim();
    if (!validNickname(trimmed)) {
      setMessage(
        "Choose a nickname of 2–16 letters, numbers, spaces, underscores or hyphens. Please keep it friendly.",
      );
      return;
    }
    const current = generation.current;
    const score = pending.score;
    setBusy(true);
    try {
      const result = await api<{
        outcome: string;
        entries: LeaderboardEntry[];
      }>("score", "POST", { ...pending, nickname: trimmed });
      if (!mounted.current) return;
      updateEntries(result.entries);
      if (result.outcome === "ok")
        bestRef.current = Math.max(bestRef.current, score);
      if (current === generation.current) {
        setPending(null);
        setMessage("");
      }
    } catch (error) {
      if (mounted.current && current === generation.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not submit your score.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <section
      data-dino-ui
      aria-labelledby="dino-leaderboard-title"
      className="mt-3 pt-3 text-sm text-black"
    >
      <h2 id="dino-leaderboard-title" className="mb-2 text-lg font-bold">
        Leaderboard (Top 12)
      </h2>
      {loading ? (
        <p>Loading scores…</p>
      ) : entries.length ? (
        <table
          className="w-full border-collapse text-left"
          aria-label="Leaderboard rankings"
        >
          <thead className="border-b border-gray-300 bg-gray-50 text-gray-600">
            <tr>
              <th scope="col" className="w-16 px-3 py-2">
                Rank
              </th>
              <th scope="col" className="px-3 py-2">
                Nickname
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={index}>
                <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                <td className="break-words px-3 py-2 font-bold">
                  {entry.nickname}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {entry.score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No scores yet. Be the first to make the board.</p>
      )}

      {pending && enabled && (
        <dialog
          ref={dialogRef}
          aria-labelledby="dino-submit-title"
          aria-describedby="dino-submit-score"
          aria-modal="true"
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 text-black shadow-xl backdrop:bg-black/50"
          onCancel={(event) => {
            event.preventDefault();
            if (!busy) setPending(null);
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <h3 id="dino-submit-title" className="mb-2 text-xl font-bold">
              Add your score
            </h3>
            <p id="dino-submit-score" className="mb-4">
              Your score of {pending.score.toLocaleString()} could make the top
              12!
            </p>
            <label htmlFor="dino-nickname" className="mb-1 block">
              Public nickname
            </label>
            <input
              ref={nicknameRef}
              id="dino-nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              minLength={2}
              maxLength={16}
              required
              autoComplete="off"
              aria-describedby="dino-name-help"
              disabled={busy}
              className="w-full rounded border border-gray-300 px-2 py-2 sm:max-w-xs"
            />
            <p id="dino-name-help" className="mt-1 text-xs text-gray-600">
              Your nickname and score will be public.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-linkblue px-3 py-2 font-bold text-white disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit score"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPending(null)}
                className="px-3 py-2 underline"
              >
                Skip
              </button>
            </div>
            {message && (
              <p role="status" aria-live="polite" className="mt-3 text-sm">
                {message}
              </p>
            )}
          </form>
        </dialog>
      )}
      {!pending && (
        <p role="status" aria-live="polite" className="mt-2">
          {message}
        </p>
      )}
    </section>
  );
}
