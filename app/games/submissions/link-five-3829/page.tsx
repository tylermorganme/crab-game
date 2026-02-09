"use client";

import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { PUZZLES } from "./puzzles";
import type { Puzzle } from "./puzzles";

// ── Types ──────────────────────────────────────────────────────────────────────

type CellStatus = "correct" | "present" | "absent" | "empty";

type GuessResult = {
  words: string[];
  statuses: CellStatus[];
};

type GameState = "playing" | "won" | "lost";

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_GUESSES = 5;
const CHAIN_LENGTH = 5;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPuzzleIndex(): number {
  // Cycle through puzzles based on a simple day offset
  const start = new Date("2026-02-09");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return ((diffDays % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
}

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function evaluateGuess(guess: string[], answer: string[]): CellStatus[] {
  const statuses: CellStatus[] = new Array(CHAIN_LENGTH).fill("absent");
  const answerUsed = new Array(CHAIN_LENGTH).fill(false);

  // First pass: mark correct positions
  for (let i = 0; i < CHAIN_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      statuses[i] = "correct";
      answerUsed[i] = true;
    }
  }

  // Second pass: mark present (right word, wrong position)
  for (let i = 0; i < CHAIN_LENGTH; i++) {
    if (statuses[i] === "correct") continue;
    for (let j = 0; j < CHAIN_LENGTH; j++) {
      if (!answerUsed[j] && guess[i] === answer[j]) {
        statuses[i] = "present";
        answerUsed[j] = true;
        break;
      }
    }
  }

  return statuses;
}

function statusEmoji(s: CellStatus): string {
  switch (s) {
    case "correct":
      return "\u{1F7E9}";
    case "present":
      return "\u{1F7E8}";
    case "absent":
      return "\u{2B1B}";
    default:
      return "\u{2B1C}";
  }
}

function statusBg(s: CellStatus): string {
  switch (s) {
    case "correct":
      return "bg-emerald-600 text-white border-emerald-700";
    case "present":
      return "bg-amber-500 text-white border-amber-600";
    case "absent":
      return "bg-zinc-500 text-white border-zinc-600 dark:bg-zinc-600 dark:border-zinc-700";
    default:
      return "bg-white border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100";
  }
}

// ── Components ─────────────────────────────────────────────────────────────────

function ChainSlot({
  word,
  status,
  index,
  isSelected,
  onClick,
  disabled,
  showConnector,
  connectionHint,
}: {
  word: string | null;
  status: CellStatus;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  showConnector: boolean;
  connectionHint: string | null;
}) {
  return (
    <div className="flex flex-col items-center">
      {showConnector && (
        <div className="flex flex-col items-center my-1">
          <div className="w-px h-2 bg-zinc-300 dark:bg-zinc-600" />
          {connectionHint ? (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic px-1">
              {connectionHint}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
              +
            </span>
          )}
          <div className="w-px h-2 bg-zinc-300 dark:bg-zinc-600" />
        </div>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full min-h-[44px] px-3 py-2 rounded-lg border-2 text-sm font-bold uppercase tracking-wider
          transition-all duration-150 select-none
          ${word ? statusBg(status) : "bg-zinc-100 border-zinc-300 border-dashed text-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-500"}
          ${isSelected ? "ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-zinc-900" : ""}
          ${disabled ? "cursor-default" : "cursor-pointer active:scale-95"}
        `}
      >
        {word || `Slot ${index + 1}`}
      </button>
    </div>
  );
}

function WordBankChip({
  word,
  used,
  onClick,
  disabled,
  status,
}: {
  word: string;
  used: boolean;
  onClick: () => void;
  disabled: boolean;
  status: CellStatus;
}) {
  const usedOrDisabled = used || disabled;
  return (
    <button
      onClick={onClick}
      disabled={usedOrDisabled}
      className={`
        px-3 py-2 rounded-lg border-2 text-sm font-bold uppercase tracking-wider
        transition-all duration-150 select-none min-h-[44px]
        ${
          used
            ? "bg-zinc-200 border-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-500 opacity-50"
            : status === "correct"
            ? "bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200"
            : status === "absent"
            ? "bg-zinc-200 border-zinc-300 text-zinc-400 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-500 line-through"
            : "bg-white border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
        }
        ${usedOrDisabled ? "cursor-default" : "cursor-pointer active:scale-95"}
      `}
    >
      {word}
    </button>
  );
}

function PastGuessRow({ result }: { result: GuessResult }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {result.words.map((word, i) => (
        <div
          key={i}
          className={`
            px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
            ${statusBg(result.statuses[i])}
            border
          `}
        >
          {word}
        </div>
      ))}
    </div>
  );
}

// ── Main Game ──────────────────────────────────────────────────────────────────

export default function LinkFiveGame() {
  const defaultPuzzleIndex = useMemo(() => getPuzzleIndex(), []);

  const [gameState, setGameState] = useState<GameState>("playing");
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentChain, setCurrentChain] = useState<(string | null)[]>(
    new Array(CHAIN_LENGTH).fill(null)
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [puzzleOverride, setPuzzleOverride] = useState<number | null>(null);

  // Allow cycling through puzzles for testing
  const activePuzzleIndex =
    puzzleOverride !== null ? puzzleOverride : defaultPuzzleIndex;
  const activePuzzle: Puzzle = PUZZLES[activePuzzleIndex];
  const activeWordBank = useMemo(() => {
    const all = [...activePuzzle.chain, ...activePuzzle.decoys];
    return shuffleArray(all, activePuzzleIndex * 9973 + 42);
  }, [activePuzzle, activePuzzleIndex]);

  // Reset game when puzzle changes
  const resetGame = useCallback(() => {
    setGameState("playing");
    setGuesses([]);
    setCurrentChain(new Array(CHAIN_LENGTH).fill(null));
    setSelectedSlot(null);
    setCopiedShare(false);
  }, []);

  // Compute known statuses across all guesses for word bank hints
  const wordStatuses = useMemo(() => {
    const map: Record<string, CellStatus> = {};
    for (const g of guesses) {
      for (let i = 0; i < g.words.length; i++) {
        const w = g.words[i];
        const s = g.statuses[i];
        // Promote status: correct > present > absent
        if (
          !map[w] ||
          s === "correct" ||
          (s === "present" && map[w] === "absent")
        ) {
          map[w] = s;
        }
      }
    }
    return map;
  }, [guesses]);

  // How many connection hints to reveal (one more after each wrong guess)
  const hintsRevealed = Math.min(guesses.length, activePuzzle.connections.length);

  // Words currently placed in chain
  const usedWords = new Set(currentChain.filter((w): w is string => w !== null));

  // Handle tapping a word bank chip
  const handleWordTap = useCallback(
    (word: string) => {
      if (gameState !== "playing") return;

      // If word is already placed, remove it
      const existingIndex = currentChain.indexOf(word);
      if (existingIndex !== -1) {
        const newChain = [...currentChain];
        newChain[existingIndex] = null;
        setCurrentChain(newChain);
        return;
      }

      // If a slot is selected, place word there
      if (selectedSlot !== null && currentChain[selectedSlot] === null) {
        const newChain = [...currentChain];
        newChain[selectedSlot] = word;
        setCurrentChain(newChain);
        // Auto-advance to next empty slot
        const nextEmpty = newChain.findIndex(
          (w, i) => w === null && i > selectedSlot
        );
        setSelectedSlot(
          nextEmpty !== -1
            ? nextEmpty
            : newChain.findIndex((w) => w === null)
        );
        return;
      }

      // Otherwise place in first empty slot
      const emptyIndex = currentChain.findIndex((w) => w === null);
      if (emptyIndex !== -1) {
        const newChain = [...currentChain];
        newChain[emptyIndex] = word;
        setCurrentChain(newChain);
        // Select next empty
        const nextEmpty = newChain.findIndex(
          (w, i) => w === null && i > emptyIndex
        );
        setSelectedSlot(
          nextEmpty !== -1
            ? nextEmpty
            : newChain.findIndex((w) => w === null)
        );
      }
    },
    [gameState, currentChain, selectedSlot]
  );

  // Handle tapping a chain slot
  const handleSlotTap = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;

      // If slot has a word, remove it
      if (currentChain[index] !== null) {
        const newChain = [...currentChain];
        newChain[index] = null;
        setCurrentChain(newChain);
        setSelectedSlot(index);
        return;
      }

      // Select this empty slot
      setSelectedSlot(index);
    },
    [gameState, currentChain]
  );

  // Submit guess
  const handleSubmit = useCallback(() => {
    if (gameState !== "playing") return;
    if (currentChain.some((w) => w === null)) return;

    const guessWords = currentChain as string[];
    const statuses = evaluateGuess(guessWords, activePuzzle.chain);
    const result: GuessResult = { words: [...guessWords], statuses };
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);

    // Check win
    if (statuses.every((s) => s === "correct")) {
      setGameState("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
    }

    // Clear chain for next guess
    setCurrentChain(new Array(CHAIN_LENGTH).fill(null));
    setSelectedSlot(null);
  }, [gameState, currentChain, guesses, activePuzzle]);

  // Clear current chain
  const handleClear = useCallback(() => {
    setCurrentChain(new Array(CHAIN_LENGTH).fill(null));
    setSelectedSlot(0);
  }, []);

  // Generate share text
  const generateShare = useCallback(() => {
    const lines = guesses.map((g) =>
      g.statuses.map((s) => statusEmoji(s)).join("")
    );
    const result =
      gameState === "won"
        ? `${guesses.length}/${MAX_GUESSES}`
        : `X/${MAX_GUESSES}`;
    return `Link Five #${activePuzzleIndex + 1} ${result}\n\n${lines.join("\n")}\n\nCan you find the chain?`;
  }, [guesses, gameState, activePuzzleIndex]);

  const handleShare = useCallback(() => {
    const text = generateShare();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  }, [generateShare]);

  const chainIsFull = currentChain.every((w) => w !== null);
  const isGameOver = gameState !== "playing";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <nav className="mx-auto max-w-md px-6 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
        {/* Puzzle selector for testing */}
        <div className="flex gap-1">
          {PUZZLES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setPuzzleOverride(i);
                resetGame();
              }}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                activePuzzleIndex === i
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-md px-6 py-6">
        {/* Title & Rules */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Link Five
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Arrange 5 words into a chain where each pair forms a compound word.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Puzzle #{activePuzzleIndex + 1} &middot; {MAX_GUESSES - guesses.length} guess{MAX_GUESSES - guesses.length !== 1 ? "es" : ""} left
          </p>
        </div>

        {/* Past Guesses */}
        {guesses.length > 0 && (
          <div className="mb-5 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Guesses
            </h2>
            {guesses.map((result, i) => (
              <PastGuessRow key={i} result={result} />
            ))}
          </div>
        )}

        {/* Current Chain Builder */}
        {!isGameOver && (
          <div className="mb-5">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Your Chain
            </h2>
            <div className="flex flex-col">
              {currentChain.map((word, i) => (
                <ChainSlot
                  key={i}
                  word={word}
                  status="empty"
                  index={i}
                  isSelected={selectedSlot === i}
                  onClick={() => handleSlotTap(i)}
                  disabled={false}
                  showConnector={i > 0}
                  connectionHint={
                    i > 0 && i - 1 < hintsRevealed
                      ? activePuzzle.connections[i - 1]
                      : null
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Connection Hints Legend */}
        {hintsRevealed > 0 && !isGameOver && (
          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold">Hints revealed:</span>{" "}
              {activePuzzle.connections.slice(0, hintsRevealed).map((c, i) => (
                <span key={i}>
                  {i > 0 && ", "}
                  <span className="italic">{c}</span>
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Word Bank */}
        {!isGameOver && (
          <div className="mb-5">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Word Bank — pick 5
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {activeWordBank.map((word) => (
                <WordBankChip
                  key={word}
                  word={word}
                  used={usedWords.has(word)}
                  onClick={() => handleWordTap(word)}
                  disabled={gameState !== "playing"}
                  status={wordStatuses[word] || "empty"}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isGameOver && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleClear}
              className="flex-1 py-3 rounded-lg border-2 border-zinc-300 text-zinc-600 font-semibold text-sm
                dark:border-zinc-600 dark:text-zinc-400
                active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!chainIsFull}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                chainIsFull
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              Submit Guess
            </button>
          </div>
        )}

        {/* Game Over */}
        {isGameOver && (
          <div className="text-center mb-6">
            {gameState === "won" ? (
              <div className="mb-4">
                <p className="text-3xl mb-2">&#x1F389;</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  You found the chain!
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Solved in {guesses.length}/{MAX_GUESSES} guess{guesses.length !== 1 ? "es" : ""}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-3xl mb-2">&#x1F614;</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  Not this time
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  The chain eluded you today
                </p>
              </div>
            )}

            {/* Reveal the answer */}
            <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                The Chain
              </p>
              <div className="flex flex-col items-center gap-1">
                {activePuzzle.chain.map((word, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {i > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="w-px h-1.5 bg-emerald-400 dark:bg-emerald-600" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">
                          {activePuzzle.connections[i - 1]}
                        </span>
                        <div className="w-px h-1.5 bg-emerald-400 dark:bg-emerald-600" />
                      </div>
                    )}
                    <span className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm font-bold uppercase tracking-wider">
                      {word}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guess history recap */}
            {guesses.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Your Attempts
                </p>
                {guesses.map((result, i) => (
                  <PastGuessRow key={i} result={result} />
                ))}
              </div>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              className="mt-5 w-full py-3 rounded-lg bg-zinc-800 text-white font-semibold text-sm
                dark:bg-zinc-200 dark:text-zinc-900
                active:scale-95 transition-all"
            >
              {copiedShare ? "Copied!" : "Share Result"}
            </button>

            {/* Share preview */}
            <pre className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 whitespace-pre-wrap text-left mx-auto max-w-fit">
              {generateShare()}
            </pre>
          </div>
        )}

        {/* How to play */}
        <details className="mt-6 mb-8">
          <summary className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
            How to Play
          </summary>
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>
              <strong>Find the hidden 5-word chain.</strong> Each consecutive pair
              of words in the chain forms a compound word or common phrase.
            </p>
            <p>
              Pick 5 words from the bank (3 are decoys!) and arrange them in
              order. You have {MAX_GUESSES} guesses.
            </p>
            <div className="flex flex-wrap gap-2 text-xs mt-2">
              <span className="px-2 py-1 rounded bg-emerald-600 text-white font-bold">
                GREEN
              </span>
              <span>= right word, right spot</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-amber-500 text-white font-bold">
                YELLOW
              </span>
              <span>= right word, wrong spot</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-zinc-500 text-white font-bold">
                GRAY
              </span>
              <span>= not in the chain (it&apos;s a decoy)</span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
              After each wrong guess, a compound-word hint is revealed between
              slots to help narrow it down.
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
