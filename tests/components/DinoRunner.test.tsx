import { act, within, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DinoRunner from "@/components/demos/DinoRunner";

vi.mock("@/components/demos/DinoLeaderboard", () => ({ default: () => null }));
vi.mock("@/lib/dino/index.js", () => ({}));

const storageKey = "twelvee-dino-unlocked-demos";
const demos = [
  { id: "first", title: "First demo", audioUrl: "/first.mp3", unlockScore: 10 },
  {
    id: "second",
    title: "Second demo",
    audioUrl: "/second.mp3",
    unlockScore: 20,
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("<div id='audio-resources'></div>")),
  );
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Dino runner hydration", () => {
  it("restores saved unlocks after hydration and still handles new unlocks", async () => {
    const container = document.createElement("div");
    // Server renders with no browser storage available.
    container.innerHTML = renderToString(<DinoRunner demos={demos} />);
    expect(container.querySelector('[aria-label="Unlocked demos"]')).toBeNull();
    document.body.appendChild(container);

    // Returning browser has saved unlocks before React hydrates the server HTML.
    localStorage.setItem(storageKey, JSON.stringify(["first"]));
    const recoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <DinoRunner demos={demos} />, {
          onRecoverableError: recoverableError,
        });
      });
      const panel = await within(container).findByRole("region", {
        name: "Unlocked demos",
      });
      expect(panel).toHaveTextContent("First demo");
      expect(panel).not.toHaveTextContent("Second demo");
      expect(recoverableError).not.toHaveBeenCalled();

      act(() => {
        container.querySelector(".dino-demo-root")!.dispatchEvent(
          new CustomEvent("dino:demo-unlocked", {
            detail: { demo: demos[1], displayScore: 20 },
          }),
        );
      });
      await waitFor(() => expect(panel).toHaveTextContent("Second demo"));
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual([
        "first",
        "second",
      ]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
