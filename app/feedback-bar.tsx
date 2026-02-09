"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function FeedbackBar() {
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const msg = value.trim();
    if (!msg) return;

    setStatus("sending");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pathname, message: msg }),
      });
      setValue("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Extract game name from path like /games/submissions/chroma
  const gameSlug = pathname.startsWith("/games/submissions/")
    ? pathname.split("/")[3]
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2">
        {gameSlug && (
          <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {gameSlug}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            gameSlug
              ? `Feedback on ${gameSlug}...`
              : "Feedback..."
          }
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
        />
        <button
          onClick={submit}
          disabled={status === "sending" || !value.trim()}
          className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {status === "sent" ? "Logged" : status === "sending" ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
