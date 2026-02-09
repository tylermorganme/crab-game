"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
  RUNES,
  PUZZLES,
  MAX_GUESSES,
  CODE_LENGTH,
  evaluateGuess,
  type RuneId,
  type Feedback,
  type Puzzle,
} from "./puzzles";

// ─── Types ─────────────────────────────────────────────────────────────

type GuessRecord = {
  runes: RuneId[];
  feedback: Feedback[];
  correctCount: number;
  misplacedCount: number;
};

type GameState = "playing" | "won" | "lost";

// ─── Share generation ──────────────────────────────────────────────────

function generateShareText(
  puzzle: Puzzle,
  guesses: GuessRecord[],
  gameState: GameState
): string {
  const emoji = {
    correct: "\uD83D\uDFE2",   // green circle
    misplaced: "\uD83D\uDFE1", // yellow circle
    wrong: "\u26AB",            // black circle
  };

  const header = `Spellcast #${puzzle.id} — ${
    gameState === "won" ? `${guesses.length}/${MAX_GUESSES}` : "X/" + MAX_GUESSES
  }`;

  const rows = guesses
    .map((g) => g.feedback.map((f) => emoji[f]).join(""))
    .join("\n");

  return `${header}\n${rows}\n\nhttps://spellcast.game`;
}

// ─── Rune display component ───────────────────────────────────────────

function RuneToken({
  runeId,
  size = "md",
  feedback,
  onClick,
  disabled,
  ghost,
  eliminated,
}: {
  runeId: RuneId | null;
  size?: "sm" | "md" | "lg";
  feedback?: Feedback;
  onClick?: () => void;
  disabled?: boolean;
  ghost?: boolean;
  eliminated?: boolean;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-11 h-11 text-xl",
    lg: "w-14 h-14 text-2xl",
  };

  if (runeId === null || ghost) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses[size]} rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center transition-all ${
          onClick && !disabled
            ? "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500"
            : "cursor-default"
        } ${disabled ? "opacity-40" : ""}`}
      />
    );
  }

  const rune = RUNES[runeId];

  let bgClass = "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
  if (feedback === "correct") {
    bgClass = "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-600";
  } else if (feedback === "misplaced") {
    bgClass = "bg-amber-100 dark:bg-amber-900/50 border-amber-400 dark:border-amber-600";
  } else if (feedback === "wrong") {
    bgClass = "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 opacity-60";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-lg border-2 ${bgClass} flex items-center justify-center transition-all select-none ${
        onClick && !disabled
          ? "cursor-pointer hover:scale-110 active:scale-95"
          : "cursor-default"
      } ${disabled ? "opacity-40" : ""} ${eliminated ? "opacity-30 line-through" : ""}`}
      style={{ color: rune.color }}
      title={rune.name}
    >
      {rune.symbol}
    </button>
  );
}

// ─── Main game component ──────────────────────────────────────────────

export default function SpellcastGame() {
  // Puzzle selection
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];

  // Game state
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [currentGuess, setCurrentGuess] = useState<(RuneId | null)[]>(
    Array(CODE_LENGTH).fill(null)
  );
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Which slot the player is currently filling
  const [activeSlot, setActiveSlot] = useState(0);

  // Reset game when puzzle changes
  useEffect(() => {
    setGuesses([]);
    setCurrentGuess(Array(CODE_LENGTH).fill(null));
    setGameState("playing");
    setShowShare(false);
    setCopied(false);
    setActiveSlot(0);
    setShowHelp(false);
  }, [puzzleIndex]);

  // Track which runes have been fully eliminated (appeared only as "wrong" in all guesses)
  const getRuneKnowledge = useCallback(() => {
    const knowledge: Record<
      RuneId,
      { everCorrect: boolean; everMisplaced: boolean; maxWrong: number; guessAppearances: number }
    > = {} as Record<RuneId, { everCorrect: boolean; everMisplaced: boolean; maxWrong: number; guessAppearances: number }>;

    for (let r = 0; r < 6; r++) {
      knowledge[r as RuneId] = {
        everCorrect: false,
        everMisplaced: false,
        maxWrong: 0,
        guessAppearances: 0,
      };
    }

    for (const g of guesses) {
      const runeCountInGuess: Record<number, number> = {};
      const runeWrongInGuess: Record<number, number> = {};

      for (let i = 0; i < CODE_LENGTH; i++) {
        const rid = g.runes[i];
        runeCountInGuess[rid] = (runeCountInGuess[rid] || 0) + 1;

        if (g.feedback[i] === "correct") {
          knowledge[rid].everCorrect = true;
        } else if (g.feedback[i] === "misplaced") {
          knowledge[rid].everMisplaced = true;
        } else {
          runeWrongInGuess[rid] = (runeWrongInGuess[rid] || 0) + 1;
        }
      }

      for (let r = 0; r < 6; r++) {
        if (runeCountInGuess[r]) {
          knowledge[r as RuneId].guessAppearances++;
        }
        if (runeWrongInGuess[r]) {
          knowledge[r as RuneId].maxWrong = Math.max(
            knowledge[r as RuneId].maxWrong,
            runeWrongInGuess[r]
          );
        }
      }
    }

    // A rune is "eliminated" if it appeared in a guess where ALL instances of it were wrong
    // and it was never correct or misplaced in any guess
    const eliminated = new Set<RuneId>();
    for (let r = 0; r < 6; r++) {
      const k = knowledge[r as RuneId];
      if (k.guessAppearances > 0 && !k.everCorrect && !k.everMisplaced && k.maxWrong > 0) {
        eliminated.add(r as RuneId);
      }
    }

    return eliminated;
  }, [guesses]);

  const eliminatedRunes = getRuneKnowledge();

  // Handle rune selection from palette
  const selectRune = useCallback(
    (runeId: RuneId) => {
      if (gameState !== "playing") return;

      // Build the next guess state so we can compute auto-advance accurately
      const nextGuess = [...currentGuess];
      nextGuess[activeSlot] = runeId;
      setCurrentGuess(nextGuess);

      // Auto-advance to next empty slot after placing rune
      let nextSlot = activeSlot;
      for (let i = 1; i <= CODE_LENGTH; i++) {
        const candidate = (activeSlot + i) % CODE_LENGTH;
        if (nextGuess[candidate] === null) {
          nextSlot = candidate;
          break;
        }
      }
      // If all filled, stay at last slot
      setActiveSlot(nextSlot);
    },
    [gameState, activeSlot, currentGuess]
  );

  // Submit guess
  const submitGuess = useCallback(() => {
    if (gameState !== "playing") return;
    if (currentGuess.some((r) => r === null)) return;

    const guess = currentGuess as RuneId[];
    const result = evaluateGuess(guess, [...puzzle.answer]);

    const record: GuessRecord = {
      runes: [...guess],
      feedback: result.perSlot,
      correctCount: result.correctCount,
      misplacedCount: result.misplacedCount,
    };

    const newGuesses = [...guesses, record];
    setGuesses(newGuesses);
    setCurrentGuess(Array(CODE_LENGTH).fill(null));
    setActiveSlot(0);

    if (result.correctCount === CODE_LENGTH) {
      setGameState("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
    }
  }, [gameState, currentGuess, guesses, puzzle.answer]);

  // Clear current guess
  const clearGuess = useCallback(() => {
    setCurrentGuess(Array(CODE_LENGTH).fill(null));
    setActiveSlot(0);
  }, []);

  // Remove rune from a slot
  const removeFromSlot = useCallback(
    (slot: number) => {
      if (gameState !== "playing") return;
      setCurrentGuess((prev) => {
        const next = [...prev];
        next[slot] = null;
        return next;
      });
      setActiveSlot(slot);
    },
    [gameState]
  );

  // Copy share to clipboard
  const copyShare = useCallback(async () => {
    const text = generateShareText(puzzle, guesses, gameState);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [puzzle, guesses, gameState]);

  const isGuessFull = currentGuess.every((r) => r !== null);
  const guessesRemaining = MAX_GUESSES - guesses.length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <nav className="mx-auto max-w-md px-6 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {showHelp ? "Close" : "How to play"}
        </button>
      </nav>

      <main className="mx-auto max-w-md px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Spellcast
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            {puzzle.flavorTitle} &mdash; Puzzle #{puzzle.id}
          </p>
        </div>

        {/* How to play */}
        {showHelp && (
          <div className="mb-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Deduce the 4-rune spell in {MAX_GUESSES} tries.
            </p>
            <p>
              Place 4 runes from the palette into the spell slots, then cast. After each attempt:
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-400 dark:border-emerald-600" />
              <span>= correct rune, correct position</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400 dark:border-amber-600" />
              <span>= correct rune, wrong position</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 opacity-60" />
              <span>= rune not in the spell</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-500 italic">
              Runes can repeat. 6 rune types, 4 slots = 1,296 possible spells.
            </p>
            <p className="text-zinc-500 dark:text-zinc-500 italic">
              Hint: &ldquo;{puzzle.flavorHint}&rdquo;
            </p>
          </div>
        )}

        {/* Puzzle selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPuzzleIndex(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                i === puzzleIndex
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        {/* Guess board */}
        <div className="space-y-2 mb-6">
          {/* Previous guesses */}
          {guesses.map((g, gi) => (
            <div key={gi} className="flex items-center justify-center gap-2">
              <div className="flex gap-1.5">
                {g.runes.map((runeId, si) => (
                  <RuneToken
                    key={si}
                    runeId={runeId}
                    size="md"
                    feedback={g.feedback[si]}
                  />
                ))}
              </div>
              <div className="ml-3 text-xs text-zinc-400 dark:text-zinc-500 w-12 text-right font-mono">
                {g.correctCount}G {g.misplacedCount}Y
              </div>
            </div>
          ))}

          {/* Current guess (only if still playing) */}
          {gameState === "playing" && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1.5">
                {currentGuess.map((runeId, si) => (
                  <button
                    key={si}
                    onClick={() => {
                      if (runeId !== null) {
                        removeFromSlot(si);
                      } else {
                        setActiveSlot(si);
                      }
                    }}
                    className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center text-xl transition-all select-none ${
                      si === activeSlot
                        ? "border-zinc-500 dark:border-zinc-400 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-400/30 dark:ring-zinc-500/30"
                        : runeId !== null
                        ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                        : "border-dashed border-zinc-300 dark:border-zinc-700"
                    } cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500`}
                    style={runeId !== null ? { color: RUNES[runeId].color } : undefined}
                  >
                    {runeId !== null ? RUNES[runeId].symbol : ""}
                  </button>
                ))}
              </div>
              <div className="ml-3 text-xs text-zinc-400 dark:text-zinc-500 w-12 text-right">
                {guessesRemaining} left
              </div>
            </div>
          )}

          {/* Empty rows for future guesses */}
          {gameState === "playing" &&
            Array.from({ length: MAX_GUESSES - guesses.length - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center justify-center gap-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: CODE_LENGTH }).map((_, si) => (
                    <RuneToken key={si} runeId={null} size="md" disabled />
                  ))}
                </div>
                <div className="ml-3 w-12" />
              </div>
            ))}
        </div>

        {/* Rune palette (only if playing) */}
        {gameState === "playing" && (
          <div className="space-y-3 mb-6">
            {/* Rune selection */}
            <div className="flex items-center justify-center gap-2">
              {RUNES.map((rune) => {
                const isEliminated = eliminatedRunes.has(rune.id as RuneId);
                return (
                  <button
                    key={rune.id}
                    onClick={() => selectRune(rune.id as RuneId)}
                    className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none cursor-pointer ${
                      isEliminated
                        ? "border-zinc-200 dark:border-zinc-800 opacity-30"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:scale-110 active:scale-95 hover:border-zinc-400 dark:hover:border-zinc-500"
                    }`}
                    style={{ color: rune.color }}
                    title={`${rune.name}${isEliminated ? " (eliminated)" : ""}`}
                  >
                    <span className="text-lg leading-none">{rune.symbol}</span>
                    <span className="text-[9px] mt-0.5 text-zinc-400 dark:text-zinc-500 leading-none">
                      {rune.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={clearGuess}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-all"
              >
                Clear
              </button>
              <button
                onClick={submitGuess}
                disabled={!isGuessFull}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  isGuessFull
                    ? "bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 cursor-pointer"
                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                }`}
              >
                Cast Spell
              </button>
            </div>
          </div>
        )}

        {/* Game over state */}
        {gameState !== "playing" && (
          <div className="text-center space-y-4 mb-6">
            {/* Result message */}
            <div
              className={`rounded-xl p-4 ${
                gameState === "won"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              }`}
            >
              {gameState === "won" ? (
                <div>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    Spell Complete!
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                    You cracked &ldquo;{puzzle.flavorTitle}&rdquo; in {guesses.length}{" "}
                    {guesses.length === 1 ? "try" : "tries"}.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">
                    Spell Fizzled
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                    The spell eluded you this time.
                  </p>
                </div>
              )}
            </div>

            {/* Reveal the answer */}
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider font-medium">
                The Spell Was
              </p>
              <div className="flex items-center justify-center gap-2">
                {puzzle.answer.map((runeId, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-2xl"
                      style={{ color: RUNES[runeId].color }}
                    >
                      {RUNES[runeId].symbol}
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {RUNES[runeId].name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3 italic">
                &ldquo;{puzzle.flavorHint}&rdquo;
              </p>
            </div>

            {/* Share */}
            <div className="space-y-2">
              <button
                onClick={() => setShowShare(!showShare)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all"
              >
                {showShare ? "Hide Share" : "Share Result"}
              </button>

              {showShare && (
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                  <pre className="text-sm text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre text-left leading-relaxed">
                    {generateShareText(puzzle, guesses, gameState)}
                  </pre>
                  <button
                    onClick={copyShare}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flavor hint (always visible as subtle text) */}
        {gameState === "playing" && (
          <div className="text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">
              &ldquo;{puzzle.flavorHint}&rdquo;
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
