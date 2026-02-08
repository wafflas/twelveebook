"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  when: string;
};

interface ChatThreadViewProps {
  messages: Message[];
  contactName: string;
  myAvatar: string;
  contactAvatar: string;
}

export function ChatThreadView({
  messages,
  contactName,
  myAvatar,
  contactAvatar,
}: ChatThreadViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col-reverse space-y-4 space-y-reverse overflow-y-auto px-3 py-3">
        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
        {messages
          .map((m) => (
            <ChatMessage
              key={m.id}
              id={m.id}
              from={m.from}
              text={m.text}
              when={m.when}
              contactName={contactName}
              myAvatar={myAvatar}
              contactAvatar={contactAvatar}
            />
          ))
          .reverse()}
      </div>

      <ChatComposer />
    </div>
  );
}
