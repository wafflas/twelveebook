import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createRef } from "react";
import DinoLeaderboard from "@/components/demos/DinoLeaderboard";

const mockFetch = vi.fn();
// jsdom does not implement the browser's modal dialog methods.
const dialogPrototype = HTMLDialogElement.prototype;
const originalShowModal = Object.getOwnPropertyDescriptor(
  dialogPrototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, "close");
beforeAll(() => {
  Object.defineProperties(dialogPrototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
});
afterAll(() => {
  for (const [name, descriptor] of [
    ["showModal", originalShowModal],
    ["close", originalClose],
  ] as const) {
    if (descriptor) Object.defineProperty(dialogPrototype, name, descriptor);
    else Reflect.deleteProperty(dialogPrototype, name);
  }
});
function response(value: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(value), { status }));
}
function mount() {
  const ref = createRef<HTMLDivElement>();
  render(
    <>
      <div ref={ref} data-testid="game" tabIndex={0} />
      <DinoLeaderboard gameRoot={ref} />
    </>,
  );
  return (name: string, detail = {}) =>
    act(() => {
      ref.current!.dispatchEvent(new CustomEvent(name, { detail }));
    });
}

beforeEach(() => {
  mockFetch
    .mockReset()
    .mockImplementation((url: string, options?: RequestInit) => {
      if (url.endsWith("leaderboard"))
        return response({ enabled: true, entries: [] });
      if (url.endsWith("session"))
        return response({ joined: options?.method === "POST" });
      if (url.endsWith("run")) return response({ token: "run-token" });
      return response({
        outcome: "ok",
        entries: [{ nickname: "Runner", score: 100 }],
      });
    });
  vi.stubGlobal("fetch", mockFetch);
});

describe("Dino leaderboard player flow", () => {
  it("shows a simple board without creating a session on page load", async () => {
    mount();
    expect(
      screen.getByRole("heading", { name: "Leaderboard (Top 12)" }),
    ).toBeInTheDocument();
    await screen.findByText("No scores yet. Be the first to make the board.");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ranked play/i }),
    ).not.toBeInTheDocument();
    expect(
      mockFetch.mock.calls.some(([, options]) => options.method === "POST"),
    ).toBe(false);
  });

  it("automatically registers play, submits and updates the board", async () => {
    const event = mount();
    // Starting immediately must wait for the initial settings to load.
    event("dino:play-start");
    event("dino:game-over", { displayScore: 100 });
    fireEvent.change(await screen.findByLabelText("Public nickname"), {
      target: { value: "Runner" },
    });
    const sessionCall = mockFetch.mock.calls.find(
      ([url, options]) => url.endsWith("session") && options.method === "POST",
    )!;
    expect(JSON.parse(sessionCall[1].body)).toEqual({ remember: false });
    fireEvent.click(screen.getByRole("button", { name: "Submit score" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("table", { name: "Leaderboard rankings" }),
    ).toHaveTextContent("Runner");
    event("dino:restart");
    event("dino:game-over", { displayScore: 90 });
    await act(async () => {});
    expect(screen.queryByLabelText("Public nickname")).not.toBeInTheDocument();
    expect(
      mockFetch.mock.calls.filter(
        ([url, options]) =>
          url.endsWith("session") && options.method === "POST",
      ),
    ).toHaveLength(1);
  });

  it("discards a stale registration response after restart", async () => {
    let resolveRun: (value: Response) => void = () => {};
    const event = mount();
    await screen.findByText("No scores yet. Be the first to make the board.");
    const normal = mockFetch.getMockImplementation()!;
    let firstRun = true;
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url.endsWith("run") && firstRun) {
        firstRun = false;
        return new Promise<Response>((resolve) => {
          resolveRun = resolve;
        });
      }
      return normal(url, options);
    });
    event("dino:play-start");
    await waitFor(() => expect(firstRun).toBe(false));
    event("dino:game-over", { displayScore: 100 });
    event("dino:restart");
    await act(async () => {
      resolveRun(new Response(JSON.stringify({ token: "stale-token" })));
    });
    expect(screen.queryByLabelText("Public nickname")).not.toBeInTheDocument();
  });

  it("allows skipping without publishing a score", async () => {
    const event = mount();
    event("dino:play-start");
    event("dino:game-over", { displayScore: 100 });
    fireEvent.click(await screen.findByRole("button", { name: "Skip" }));
    expect(mockFetch.mock.calls.some(([url]) => url.endsWith("score"))).toBe(
      false,
    );
    expect(screen.queryByLabelText("Public nickname")).not.toBeInTheDocument();
    expect(screen.getByTestId("game")).toHaveFocus();
  });

  it("focuses the popup and lets Escape cancel without submitting", async () => {
    const event = mount();
    event("dino:play-start");
    event("dino:game-over", { displayScore: 100 });
    const dialog = await screen.findByRole("dialog", {
      name: "Add your score",
    });
    expect(screen.getByLabelText("Public nickname")).toHaveFocus();
    fireEvent(
      dialog,
      new Event("cancel", { bubbles: false, cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("game")).toHaveFocus();
    expect(mockFetch.mock.calls.some(([url]) => url.endsWith("score"))).toBe(
      false,
    );
  });

  it("keeps local play available when registration fails", async () => {
    const event = mount();
    await screen.findByText("No scores yet. Be the first to make the board.");
    mockFetch.mockImplementationOnce(() =>
      response({ error: "Too many attempts. Please wait." }, 429),
    );
    event("dino:play-start");
    event("dino:game-over", { displayScore: 100 });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Too many attempts"),
    );
    expect(screen.queryByLabelText("Public nickname")).not.toBeInTheDocument();
  });

  it("keeps dialog simple without checkbox and submits score", async () => {
    const event = mount();
    event("dino:play-start");
    event("dino:game-over", { displayScore: 100 });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.change(await screen.findByLabelText("Public nickname"), {
      target: { value: "Anon" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit score" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    const scoreCall = mockFetch.mock.calls.find(
      ([url, options]) => url.endsWith("score") && options.method === "POST",
    )!;
    expect(JSON.parse(scoreCall[1].body)).toMatchObject({
      nickname: "Anon",
    });
  });
});
