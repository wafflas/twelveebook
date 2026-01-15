import React from "react";

export function ChatComposer() {
  return (
    <div className="border-t border-gray-200 px-3 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="w-full rounded border border-gray-300 px-2 py-2 text-sm outline-none"
          placeholder="Write a message…"
          readOnly
        />
        <button
          className="rounded bg-linkblue px-3 py-2 text-sm text-white opacity-60"
          disabled
        >
          Send
        </button>
      </div>
    </div>
  );
}
