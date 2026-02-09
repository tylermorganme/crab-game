"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
// HOT & COLD
// Guess the secret word by navigating semantic space.
// Each guess tells you how close you are in meaning.
// ============================================================

interface GuessResult {
  guess: string;
  similarity: number;
  rank: number | null;
  totalWords: number;
  temperature: string;
  won: boolean;
}

const TEMP_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  correct:  { color: "text-yellow-300", bg: "bg-yellow-300/10", emoji: "\u2B50" },
  "on fire": { color: "text-red-400", bg: "bg-red-400/10", emoji: "\uD83D\uDD25" },
  hot:      { color: "text-orange-400", bg: "bg-orange-400/10", emoji: "\uD83D\uDD36" },
  warm:     { color: "text-amber-400", bg: "bg-amber-400/10", emoji: "\uD83D\uDFE1" },
  tepid:    { color: "text-zinc-400", bg: "bg-zinc-400/10", emoji: "\u26AA" },
  cold:     { color: "text-blue-400", bg: "bg-blue-400/10", emoji: "\uD83D\uDD35" },
  freezing: { color: "text-blue-300", bg: "bg-blue-300/10", emoji: "\u2744\uFE0F" },
};

function temperatureBar(similarity: number): number {
  // Map similarity (~0.15 to ~0.60) to 0-100 for visual bar
  const min = 0.15;
  const max = 0.60;
  const clamped = Math.max(min, Math.min(max, similarity));
  return Math.round(((clamped - min) / (max - min)) * 100);
}

function generateShareText(guesses: GuessResult[]): string {
  const lines = guesses.map((g) => {
    const cfg = TEMP_CONFIG[g.temperature] || TEMP_CONFIG.cold;
    return cfg.emoji;
  });
  return `Hot & Cold #${new Date().toISOString().slice(0, 10)}\n${guesses.length} guesses\n${lines.join("")}`;
}

export default function HotColdGame() {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [guesses]);

  const submitGuess = useCallback(async () => {
    const word = input.trim().toLowerCase();
    if (!word || loading || won) return;

    // Don't allow duplicate guesses
    if (guesses.some((g) => g.guess === word)) {
      setError("Already guessed that word");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hot-cold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: word }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const result: GuessResult = data;
      setGuesses((prev) => [...prev, result]);
      setInput("");

      if (result.won) {
        setWon(true);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }, [input, loading, won, guesses]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      }
    },
    [submitGuess]
  );

  const handleShare = useCallback(() => {
    const text = generateShareText(guesses);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [guesses]);

  // Sort guesses by similarity for the "best guesses" view
  const sortedGuesses = [...guesses].sort((a, b) => b.similarity - a.similarity);
  const bestGuess = sortedGuesses[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
        >
          &larr; back
        </Link>

        <div className="mt-4 mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Hot & Cold</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Guess the secret word. Each guess shows how close you are in meaning.
          </p>
        </div>

        {/* Input */}
        {!won && (
          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ""))}
              onKeyDown={handleKeyDown}
              placeholder="Type a word..."
              disabled={loading}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button
              onClick={submitGuess}
              disabled={loading || !input.trim()}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-100 px-5 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? "..." : "Guess"}
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center mb-3">{error}</p>
        )}

        {/* Recent guesses — last 3, chronological */}
        {guesses.length > 0 && !won && (
          <div className="mb-4 space-y-1">
            {guesses.slice(-3).map((g) => {
              const cfg = TEMP_CONFIG[g.temperature] || TEMP_CONFIG.cold;
              return (
                <div key={g.guess} className="flex items-center justify-between px-3 py-1.5 rounded-md bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className={`text-sm ${cfg.color}`}>{g.guess}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.rank !== null && (
                      <span className="text-zinc-500 text-xs">#{g.rank.toLocaleString()} / {g.totalWords.toLocaleString()}</span>
                    )}
                    <span className={`text-sm font-mono ${cfg.color}`}>{g.similarity.toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Best guess indicator */}
        {bestGuess && !won && (
          <div className="text-center mb-4">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
              Closest so far
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`font-bold ${TEMP_CONFIG[bestGuess.temperature]?.color || "text-zinc-400"}`}>
                {bestGuess.guess}
              </span>
              <span className="text-zinc-600 text-sm">
                {(bestGuess.similarity * 100).toFixed(1)}%
              </span>
            </div>
            {/* Temperature bar */}
            <div className="mt-2 w-full max-w-xs mx-auto h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${temperatureBar(bestGuess.similarity)}%`,
                  background: `linear-gradient(90deg, #3b82f6, #f59e0b, #ef4444)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Win state */}
        {won && (
          <div className="text-center mb-6 py-6 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
            <div className="text-3xl mb-2">{"\u2B50"}</div>
            <div className="text-yellow-300 font-bold text-lg">
              You got it in {guesses.length} guess{guesses.length !== 1 ? "es" : ""}!
            </div>
            <div className="text-zinc-400 text-sm mt-1">
              The word was <span className="text-zinc-100 font-bold">{guesses[guesses.length - 1].guess}</span>
            </div>
            <button
              onClick={handleShare}
              className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? "Copied!" : "Share result"}
            </button>
          </div>
        )}

        {/* Guess list — sorted by similarity, highest first */}
        {guesses.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-600 text-xs uppercase tracking-wider px-1 mb-2">
              <span>rank / word</span>
              <span>similarity</span>
            </div>
            {sortedGuesses.map((g, i) => {
              const cfg = TEMP_CONFIG[g.temperature] || TEMP_CONFIG.cold;
              const pct = temperatureBar(g.similarity);
              return (
                <div
                  key={i}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-lg ${cfg.bg} overflow-hidden`}
                >
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 opacity-10 rounded-lg"
                    style={{
                      width: `${pct}%`,
                      background:
                        g.temperature === "correct"
                          ? "#facc15"
                          : g.temperature === "on fire"
                          ? "#ef4444"
                          : g.temperature === "hot"
                          ? "#f97316"
                          : g.temperature === "warm"
                          ? "#f59e0b"
                          : g.temperature === "cold"
                          ? "#3b82f6"
                          : g.temperature === "freezing"
                          ? "#93c5fd"
                          : "#71717a",
                    }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="text-zinc-600 text-xs w-6">#{i + 1}</span>
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className={`font-medium ${cfg.color}`}>{g.guess}</span>
                  </div>
                  <div className="relative flex items-center gap-3">
                    {g.rank !== null && (
                      <span className="text-zinc-600 text-xs font-mono">#{g.rank.toLocaleString()}</span>
                    )}
                    <span className="text-zinc-500 text-xs">{g.temperature}</span>
                    <span className={`text-sm font-mono ${cfg.color}`}>
                      {g.won ? "1.0" : g.similarity.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={listEndRef} />
          </div>
        )}

        {/* Guess count */}
        {guesses.length > 0 && !won && (
          <div className="text-center mt-4 text-zinc-600 text-sm">
            {guesses.length} guess{guesses.length !== 1 ? "es" : ""} so far
          </div>
        )}

        {/* Help text */}
        <div className="mt-8 text-center text-zinc-700 text-xs space-y-1">
          <p>Words are compared by meaning using AI embeddings.</p>
          <p>Closer in meaning = higher similarity = hotter.</p>
          <p>New word every day.</p>
        </div>
      </div>
    </div>
  );
}
