"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";

// ============================================================
// SIGNAL LOCK
// Tune four dials to lock onto the hidden frequency.
// Each guess narrows the static into clarity.
// ============================================================

// --- Puzzles: 5 baked-in daily puzzles ---
const PUZZLES = [
  { id: 1, code: [3, 8, 1, 6], hint: "Somewhere between dusk and dawn" },
  { id: 2, code: [7, 2, 9, 4], hint: "A cardinal direction, scrambled" },
  { id: 3, code: [5, 0, 6, 3], hint: "Counting down from the middle" },
  { id: 4, code: [9, 4, 2, 7], hint: "The edges of a square, rearranged" },
  { id: 5, code: [1, 6, 8, 3], hint: "Fragments of a familiar year" },
];

const MAX_GUESSES = 8;
const NUM_DIALS = 4;

type DialFeedback = "locked" | "drifting" | "static";

interface GuessResult {
  guess: number[];
  feedback: DialFeedback[];
  signalStrength: number;
}

// --- Core game logic ---

function evaluateGuess(
  guess: number[],
  code: number[]
): { feedback: DialFeedback[]; signalStrength: number } {
  const feedback: DialFeedback[] = new Array(NUM_DIALS);
  let locked = 0;
  let drifting = 0;

  const codeRemaining = [...code];
  const guessRemaining: (number | null)[] = [...guess];

  // First pass: exact matches
  for (let i = 0; i < NUM_DIALS; i++) {
    if (guess[i] === code[i]) {
      feedback[i] = "locked";
      locked++;
      codeRemaining[i] = -1;
      guessRemaining[i] = null;
    }
  }

  // Second pass: right digit, wrong position
  for (let i = 0; i < NUM_DIALS; i++) {
    if (guessRemaining[i] === null) continue;
    const idx = codeRemaining.indexOf(guessRemaining[i] as number);
    if (idx !== -1) {
      feedback[i] = "drifting";
      drifting++;
      codeRemaining[idx] = -1;
    } else {
      feedback[i] = "static";
    }
  }

  const signalStrength = Math.min(100, locked * 25 + drifting * 5);
  return { feedback, signalStrength };
}

// Compute how many codes still match all prior feedback
function computeRemainingPossibilities(guesses: GuessResult[]): number {
  if (guesses.length === 0) return 10000;
  let count = 0;
  for (let n = 0; n < 10000; n++) {
    const candidate = [
      Math.floor(n / 1000) % 10,
      Math.floor(n / 100) % 10,
      Math.floor(n / 10) % 10,
      n % 10,
    ];
    let valid = true;
    for (const g of guesses) {
      const { feedback } = evaluateGuess(g.guess, candidate);
      for (let i = 0; i < NUM_DIALS; i++) {
        if (feedback[i] !== g.feedback[i]) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
    if (valid) count++;
  }
  return count;
}

// --- Share text generation ---
function generateShareText(
  puzzleId: number,
  guesses: GuessResult[],
  won: boolean
): string {
  const signalBars = (strength: number): string => {
    if (strength === 100) return "\u2593\u2593\u2593\u2593";
    if (strength >= 75) return "\u2593\u2593\u2593\u2591";
    if (strength >= 50) return "\u2593\u2593\u2591\u2591";
    if (strength >= 25) return "\u2593\u2591\u2591\u2591";
    return "\u2591\u2591\u2591\u2591";
  };

  const feedbackToEmoji = (fb: DialFeedback): string => {
    switch (fb) {
      case "locked":
        return "\ud83d\udfe2";
      case "drifting":
        return "\ud83d\udfe1";
      case "static":
        return "\u26ab";
    }
  };

  let text = `\ud83d\udce1 Signal Lock #${puzzleId}\n`;
  text += won
    ? `Locked in ${guesses.length}/${MAX_GUESSES}\n\n`
    : `Lost signal ${guesses.length}/${MAX_GUESSES}\n\n`;

  for (const g of guesses) {
    const bar = signalBars(g.signalStrength);
    const dials = g.feedback.map(feedbackToEmoji).join("");
    text += `${bar} ${dials}\n`;
  }

  text += "\nsignal-lock";
  return text;
}

// --- Sub-components ---

function SignalMeter({
  strength,
  animate,
}: {
  strength: number;
  animate: boolean;
}) {
  const bars = 12;
  const filled = Math.round((strength / 100) * bars);

  return (
    <div
      className="flex items-end gap-0.5 h-8"
      aria-label={`Signal strength: ${strength}%`}
    >
      {Array.from({ length: bars }, (_, i) => {
        const height = 8 + (i / (bars - 1)) * 24;
        const isFilled = i < filled;
        const color =
          strength === 100
            ? "bg-emerald-500"
            : i < bars * 0.33
              ? "bg-red-400"
              : i < bars * 0.66
                ? "bg-amber-400"
                : "bg-emerald-400";
        return (
          <div
            key={i}
            className={`w-2 rounded-sm transition-all ${
              animate ? "duration-500" : "duration-0"
            } ${isFilled ? color : "bg-zinc-200 dark:bg-zinc-700"}`}
            style={{
              height: `${height}px`,
              transitionDelay: animate ? `${i * 40}ms` : "0ms",
            }}
          />
        );
      })}
    </div>
  );
}

function GuessRow({ result, index }: { result: GuessResult; index: number }) {
  const feedbackLabel = (fb: DialFeedback) => {
    switch (fb) {
      case "locked":
        return "Locked";
      case "drifting":
        return "Drifting";
      case "static":
        return "Static";
    }
  };

  const feedbackStyle = (fb: DialFeedback) => {
    switch (fb) {
      case "locked":
        return "bg-emerald-500 text-white";
      case "drifting":
        return "bg-amber-400 text-zinc-900";
      case "static":
        return "bg-zinc-300 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400";
    }
  };

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-zinc-400 w-4 text-right font-mono">
        {index + 1}
      </span>
      <div className="flex gap-1.5">
        {result.guess.map((digit, i) => (
          <div
            key={i}
            className={`w-9 h-9 flex items-center justify-center rounded font-mono font-bold text-sm ${feedbackStyle(result.feedback[i])}`}
            title={feedbackLabel(result.feedback[i])}
          >
            {digit}
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <SignalMeter strength={result.signalStrength} animate={false} />
    </div>
  );
}

function PossibilityCounter({
  count,
  total,
  animate,
}: {
  count: number;
  total: number;
  animate: boolean;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const display = count >= 10000 ? "10,000" : count.toLocaleString();

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Possibility space
        </span>
        <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300">
          {display}
        </span>
      </div>
      <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            animate ? "duration-1000" : "duration-0"
          } ${
            pct <= 1
              ? "bg-emerald-500"
              : pct <= 10
                ? "bg-amber-400"
                : "bg-blue-400"
          }`}
          style={{ width: `${Math.max(pct, 0.5)}%` }}
        />
      </div>
    </div>
  );
}

function DigitTracker({ guesses }: { guesses: GuessResult[] }) {
  const digitStatus = Array.from({ length: 10 }, (_, digit) => {
    let everLocked = false;
    let everDrifting = false;
    let everStatic = false;

    for (const g of guesses) {
      for (let i = 0; i < NUM_DIALS; i++) {
        if (g.guess[i] === digit) {
          if (g.feedback[i] === "locked") everLocked = true;
          else if (g.feedback[i] === "drifting") everDrifting = true;
          else if (g.feedback[i] === "static") everStatic = true;
        }
      }
    }

    if (everLocked) return "locked" as const;
    if (everDrifting) return "drifting" as const;
    if (everStatic) return "eliminated" as const;
    return "unknown" as const;
  });

  return (
    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 text-center">
        Digits
      </div>
      <div className="flex justify-center gap-1.5">
        {digitStatus.map((status, digit) => (
          <div
            key={digit}
            className={`w-7 h-8 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
              status === "locked"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                : status === "drifting"
                  ? "bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40"
                  : status === "eliminated"
                    ? "bg-zinc-200 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-700 line-through"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Game Component ---

export default function SignalLock() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [dials, setDials] = useState<number[]>([0, 0, 0, 0]);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [showHint, setShowHint] = useState(false);
  const [possibilities, setPossibilities] = useState(10000);
  const [animateSignal, setAnimateSignal] = useState(false);
  const [animatePossibilities, setAnimatePossibilities] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Refs to avoid stale closures in event handlers
  const dialsRef = useRef(dials);
  dialsRef.current = dials;
  const guessesRef = useRef(guesses);
  guessesRef.current = guesses;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const puzzleIndexRef = useRef(puzzleIndex);
  puzzleIndexRef.current = puzzleIndex;

  const dialInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const puzzle = PUZZLES[puzzleIndex];

  // Recompute possibilities when guesses change
  useEffect(() => {
    if (guesses.length === 0) {
      setPossibilities(10000);
      setAnimatePossibilities(false);
      return;
    }
    const timer = setTimeout(() => {
      const count = computeRemainingPossibilities(guesses);
      setPossibilities(count);
      setAnimatePossibilities(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [guesses]);

  const handleDialChange = useCallback((index: number, value: number) => {
    setDials((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const submitGuess = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const currentDials = dialsRef.current;
    const currentGuesses = guessesRef.current;
    const currentPuzzle = PUZZLES[puzzleIndexRef.current];

    const { feedback, signalStrength } = evaluateGuess(
      currentDials,
      currentPuzzle.code
    );
    const result: GuessResult = {
      guess: [...currentDials],
      feedback,
      signalStrength,
    };

    const newGuesses = [...currentGuesses, result];
    setGuesses(newGuesses);
    setAnimateSignal(true);
    setTimeout(() => setAnimateSignal(false), 600);

    if (signalStrength === 100) {
      setGameState("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const currentDials = dialsRef.current;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleDialChange(index, (currentDials[index] + 1) % 10);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDialChange(index, (currentDials[index] + 9) % 10);
      } else if (e.key === "ArrowRight" && index < 3) {
        e.preventDefault();
        dialInputRefs[index + 1].current?.focus();
        dialInputRefs[index + 1].current?.select();
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        dialInputRefs[index - 1].current?.focus();
        dialInputRefs[index - 1].current?.select();
      } else if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDialChange(index, parseInt(e.key));
        if (index < 3) {
          setTimeout(() => {
            dialInputRefs[index + 1].current?.focus();
            dialInputRefs[index + 1].current?.select();
          }, 0);
        }
      }
    },
    [handleDialChange, submitGuess]
  );

  const handleShare = useCallback(async () => {
    const text = generateShareText(
      puzzle.id,
      guessesRef.current,
      gameStateRef.current === "won"
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [puzzle.id]);

  const switchPuzzle = useCallback((idx: number) => {
    setPuzzleIndex(idx);
    setDials([0, 0, 0, 0]);
    setGuesses([]);
    setGameState("playing");
    setShowHint(false);
    setPossibilities(10000);
    setCopied(false);
    setAnimatePossibilities(false);
  }, []);

  const currentSignal =
    guesses.length > 0 ? guesses[guesses.length - 1].signalStrength : 0;

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
          onClick={() => setShowHelp((h) => !h)}
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {showHelp ? "Close" : "How to play"}
        </button>
      </nav>

      <main className="mx-auto max-w-md px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            <span className="inline-block mr-1.5" aria-hidden="true">
              &#x1F4E1;
            </span>{" "}
            Signal Lock
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Tune the dials. Find the frequency.
          </p>
        </div>

        {/* Help panel */}
        {showHelp && (
          <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
            <p>
              <strong className="text-zinc-800 dark:text-zinc-200">
                Goal:
              </strong>{" "}
              Find the 4-digit code in {MAX_GUESSES} guesses.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-500 inline-flex items-center justify-center text-white text-xs font-bold shrink-0">
                  3
                </span>
                <span>
                  <strong>Locked</strong> &mdash; correct digit, correct
                  position
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-amber-400 inline-flex items-center justify-center text-zinc-900 text-xs font-bold shrink-0">
                  7
                </span>
                <span>
                  <strong>Drifting</strong> &mdash; correct digit, wrong
                  position
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-zinc-300 dark:bg-zinc-700 inline-flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-xs font-bold shrink-0">
                  5
                </span>
                <span>
                  <strong>Static</strong> &mdash; digit not in the code
                </span>
              </div>
            </div>
            <p>
              Watch the <strong>possibility counter</strong> collapse from
              10,000 to 1. Each guess eliminates thousands of candidates. The{" "}
              <strong>signal meter</strong> shows how close your latest guess
              is.
            </p>
            <p>
              Use the arrow buttons or type digits directly. Arrow keys navigate
              between dials.
            </p>
          </div>
        )}

        {/* Puzzle selector */}
        <div className="flex justify-center gap-2 mb-6">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => switchPuzzle(i)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                i === puzzleIndex
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        {/* Possibility counter -- the heart of "Infinite to One" */}
        <div className="mb-5">
          <PossibilityCounter
            count={possibilities}
            total={10000}
            animate={animatePossibilities}
          />
        </div>

        {/* Signal meter */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Signal
          </span>
          <SignalMeter strength={currentSignal} animate={animateSignal} />
          <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300 w-10 text-right">
            {currentSignal}%
          </span>
        </div>

        {/* Guess history */}
        {guesses.length > 0 && (
          <div className="mb-5 space-y-0.5">
            {guesses.map((result, i) => (
              <GuessRow key={i} result={result} index={i} />
            ))}
          </div>
        )}

        {/* Dial input area */}
        {gameState === "playing" && (
          <div className="mb-5">
            <div className="flex justify-center gap-3">
              {dials.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDialChange(i, (val + 1) % 10)}
                    className="w-10 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    aria-label={`Increment dial ${i + 1}`}
                  >
                    <svg
                      width="16"
                      height="10"
                      viewBox="0 0 16 10"
                      fill="none"
                    >
                      <path
                        d="M2 8L8 2L14 8"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <input
                    ref={dialInputRefs[i]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={val}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^[0-9]$/.test(v)) {
                        handleDialChange(i, parseInt(v));
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-14 h-16 text-center text-2xl font-mono font-bold rounded-lg border-2 transition-all duration-300 bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 text-zinc-900 dark:text-zinc-100"
                    aria-label={`Dial ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDialChange(i, (val + 9) % 10)}
                    className="w-10 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    aria-label={`Decrement dial ${i + 1}`}
                  >
                    <svg
                      width="16"
                      height="10"
                      viewBox="0 0 16 10"
                      fill="none"
                    >
                      <path
                        d="M2 2L8 8L14 2"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={submitGuess}
                className="px-8 py-2.5 bg-zinc-800 text-white rounded-lg font-medium text-sm hover:bg-zinc-700 active:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
              >
                Transmit ({guesses.length}/{MAX_GUESSES})
              </button>
            </div>
          </div>
        )}

        {/* Hint (available after 3 guesses) */}
        {gameState === "playing" && guesses.length >= 3 && !showHint && (
          <div className="flex justify-center mb-5">
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
            >
              Need a hint?
            </button>
          </div>
        )}
        {showHint && gameState === "playing" && (
          <div className="text-center text-sm text-amber-600 dark:text-amber-400 mb-5 italic">
            &ldquo;{puzzle.hint}&rdquo;
          </div>
        )}

        {/* Win state */}
        {gameState === "won" && (
          <div className="text-center space-y-4 py-4">
            <div>
              <div className="text-3xl mb-2" aria-hidden="true">
                &#x1F4E1;
              </div>
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Signal Locked!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Frequency found in {guesses.length}{" "}
                {guesses.length === 1 ? "attempt" : "attempts"}
              </p>
              <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-2 tracking-widest">
                {puzzle.code.join(" ")}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-500 active:bg-emerald-700 transition-colors"
            >
              {copied ? "Copied!" : "Share result"}
            </button>
          </div>
        )}

        {/* Lose state */}
        {gameState === "lost" && (
          <div className="text-center space-y-4 py-4">
            <div>
              <div className="text-3xl mb-2" aria-hidden="true">
                &#x1F4FB;
              </div>
              <h2 className="text-xl font-bold text-red-500 dark:text-red-400">
                Signal Lost
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                The frequency was
              </p>
              <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-2 tracking-widest">
                {puzzle.code.join(" ")}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="px-6 py-2.5 bg-zinc-600 text-white rounded-lg font-medium text-sm hover:bg-zinc-500 active:bg-zinc-700 transition-colors"
            >
              {copied ? "Copied!" : "Share result"}
            </button>
          </div>
        )}

        {/* Legend */}
        {guesses.length > 0 && gameState === "playing" && (
          <div className="flex justify-center gap-6 text-xs text-zinc-400 dark:text-zinc-500 mt-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Locked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
              Drifting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-zinc-300 dark:bg-zinc-700 inline-block" />
              Static
            </span>
          </div>
        )}

        {/* Digit tracker */}
        {guesses.length > 0 && gameState === "playing" && (
          <DigitTracker guesses={guesses} />
        )}
      </main>
    </div>
  );
}
