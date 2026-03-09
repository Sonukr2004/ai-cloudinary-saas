"use client";

import React, { useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function CloudCraftChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m CloudCraft Chat. Ask me anything about using the app: video compression, social share, or how to navigate CloudCraft Studio.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    setIsSending(true);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    scrollToBottom();

    try {
      const res = await fetch("/api/cloudcraft-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to get response");
      }

      const assistantText = String(data?.message?.content ?? "").trim();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText || "Done." },
      ]);
      scrollToBottom();
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: e?.message || "Something went wrong. Please try again.",
        },
      ]);
      scrollToBottom();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <div className="card bg-base-100/90 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">CloudCraft Chat</h1>
          <p className="text-base-content/70">
            Ask me how to use the app; I won’t generate or edit images here.
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div
            ref={scrollRef}
            className="rounded-xl border border-base-300 bg-base-200/30 p-4 h-[55vh] overflow-y-auto space-y-3"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`chat ${m.role === "user" ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble whitespace-pre-wrap ${
                    m.role === "user"
                      ? "chat-bubble-primary"
                      : "chat-bubble"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input input-bordered w-full"
              placeholder="Ask CloudCraft…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={isSending}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}