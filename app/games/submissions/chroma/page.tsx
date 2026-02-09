"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type HSL = { h: number; s: number; l: number };

type Guess = {
  color: HSL;
  deltaH: number; // signed difference
  deltaS: number;
  deltaL: number;
  distance: number; // 0-100 closeness score
};

type GameState = "playing" | "won" | "lost";

// ─── Puzzles ─────────────────────────────────────────────────────────────────
// 5 hand-picked daily puzzles with distinct, interesting target colors.
// Each has a poetic name (revealed on win) and a subtle clue.

const PUZZLES = [
  {
    target: { h: 16, s: 85, l: 55 },
    name: "Ember",
    clue: "A dying fire still glows",
  },
  {
    target: { h: 162, s: 72, l: 44 },
    name: "Lagoon",
    clue: "Where the jungle meets the sea",
  },
  {
    target: { h: 271, s: 65, l: 58 },
    name: "Amethyst",
    clue: "Royalty in crystalline form",
  },
  {
    target: { h: 45, s: 90, l: 52 },
    name: "Marigold",
    clue: "The flower that faces the sun",
  },
  {
    target: { h: 340, s: 70, l: 48 },
    name: "Garnet",
    clue: "Deep as a winter jewel",
  },
];

const MAX_GUESSES = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hslToString(c: HSL): string {
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

/** Circular distance for hue (0-180 max) */
function hueDelta(a: number, b: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return diff;
}

/** Signed delta: positive means "go higher" */
function signedDelta(guess: number, target: number): number {
  return target - guess;
}

/** Overall closeness 0-100 based on channel distances */
function closeness(guess: HSL, target: HSL): number {
  const hDist = Math.abs(hueDelta(guess.h, target.h)) / 180; // 0-1
  const sDist = Math.abs(guess.s - target.s) / 100; // 0-1
  const lDist = Math.abs(guess.l - target.l) / 100; // 0-1
  const totalDist = hDist * 0.5 + sDist * 0.25 + lDist * 0.25; // weighted
  return Math.round((1 - totalDist) * 100);
}

/** Get emoji for closeness score */
function closenessEmoji(score: number): string {
  if (score >= 97) return "\u{1F7E2}"; // green circle - exact
  if (score >= 90) return "\u{1F7E1}"; // yellow circle - very close
  if (score >= 75) return "\u{1F7E0}"; // orange circle - warm
  if (score >= 55) return "\u{1F534}"; // red circle - getting there
  return "\u{26AB}"; // black circle - cold
}

/** Direction arrow for a channel delta */
function dirArrow(delta: number, threshold: number): string {
  if (Math.abs(delta) <= threshold) return "\u2713"; // checkmark
  return delta > 0 ? "\u2191" : "\u2193"; // up or down arrow
}

/** Channel proximity label */
function proximityLabel(delta: number, maxRange: number): string {
  const pct = Math.abs(delta) / maxRange;
  if (pct <= 0.03) return "Locked";
  if (pct <= 0.1) return "Close";
  if (pct <= 0.25) return "Warm";
  if (pct <= 0.5) return "Far";
  return "Way off";
}

/** Get puzzle index based on date (cycles through 5) */
function getPuzzleIndex(): number {
  const now = new Date();
  const start = new Date(2026, 0, 1); // Jan 1 2026
  const daysSinceStart = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return ((daysSinceStart % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
}

// ─── Slider Component ────────────────────────────────────────────────────────

function ColorSlider({
  label,
  value,
  min,
  max,
  gradient,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  gradient: string;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
          {value}
        </span>
      </div>
      <div className="relative h-8 w-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="slider-input absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

// ─── Guess Row Component ─────────────────────────────────────────────────────

function GuessRow({ guess, index }: { guess: Guess; index: number }) {
  const hRange = 180;
  const sRange = 100;
  const lRange = 100;
  const hThreshold = 5;
  const sThreshold = 3;
  const lThreshold = 3;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="w-5 shrink-0 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
        {index + 1}
      </span>
      <div
        className="h-8 w-8 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700"
        style={{ backgroundColor: hslToString(guess.color) }}
      />
      <div className="flex flex-1 items-center gap-2 text-xs">
        <ChannelFeedback
          label="H"
          delta={guess.deltaH}
          maxRange={hRange}
          threshold={hThreshold}
        />
        <ChannelFeedback
          label="S"
          delta={guess.deltaS}
          maxRange={sRange}
          threshold={sThreshold}
        />
        <ChannelFeedback
          label="L"
          delta={guess.deltaL}
          maxRange={lRange}
          threshold={lThreshold}
        />
      </div>
      <div className="shrink-0 text-right">
        <span className="text-lg">{closenessEmoji(guess.distance)}</span>
      </div>
    </div>
  );
}

function ChannelFeedback({
  label,
  delta,
  maxRange,
  threshold,
}: {
  label: string;
  delta: number;
  maxRange: number;
  threshold: number;
}) {
  const isLocked = Math.abs(delta) <= threshold;
  const arrow = dirArrow(delta, threshold);
  const prox = proximityLabel(delta, maxRange);

  return (
    <div
      className={`flex flex-col items-center rounded px-1.5 py-0.5 ${
        isLocked
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      <span className="font-bold">
        {label} {arrow}
      </span>
      <span className="text-[10px]">{prox}</span>
    </div>
  );
}

// ─── How To Play Modal ───────────────────────────────────────────────────────

function HowToPlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          How to Play
        </h2>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong className="text-zinc-800 dark:text-zinc-200">
              Guess the secret color in 6 tries.
            </strong>
          </p>
          <p>
            Use the three sliders to mix a color by adjusting its{" "}
            <strong>Hue</strong>, <strong>Saturation</strong>, and{" "}
            <strong>Lightness</strong>.
          </p>
          <p>After each guess, you will see:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Arrows</strong> showing if each channel needs to go{" "}
              <span className="font-mono">{"\u2191"}</span> higher or{" "}
              <span className="font-mono">{"\u2193"}</span> lower
            </li>
            <li>
              <strong>Proximity</strong> hints: Way off, Far, Warm, Close,
              Locked
            </li>
            <li>
              A <strong>closeness dot</strong> showing overall accuracy
            </li>
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg">{"\u26AB"}</span>
            <span>Cold</span>
            <span className="text-lg">{"\u{1F534}"}</span>
            <span>Getting there</span>
            <span className="text-lg">{"\u{1F7E0}"}</span>
            <span>Warm</span>
            <span className="text-lg">{"\u{1F7E1}"}</span>
            <span>Hot</span>
            <span className="text-lg">{"\u{1F7E2}"}</span>
            <span>Match!</span>
          </div>
          <p>
            The clue gives a poetic hint at the color. Use it with the feedback
            to dial in your answer.
          </p>
          <p className="text-zinc-500 dark:text-zinc-500">
            A channel is <strong>Locked</strong> when you are within a few
            points of the target. Lock all three channels to win!
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Main Game Component ─────────────────────────────────────────────────────

export default function ChromaGame() {
  const puzzleIndex = useMemo(() => getPuzzleIndex(), []);

  // Allow cycling puzzles for testing (without affecting the "daily" puzzle concept)
  const [activePuzzleIdx, setActivePuzzleIdx] = useState(puzzleIndex);
  const activePuzzle = PUZZLES[activePuzzleIdx];

  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(50);
  const [lit, setLit] = useState(50);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPuzzleNav, setShowPuzzleNav] = useState(false);
  const guessListRef = useRef<HTMLDivElement>(null);

  const target = activePuzzle.target;

  // Win threshold: closeness >= 97 (channels all within tolerance)
  const WIN_THRESHOLD = 97;

  const handleGuess = useCallback(() => {
    if (gameState !== "playing") return;

    const guess: HSL = { h: hue, s: sat, l: lit };
    const dH = hueDelta(hue, target.h);
    const dS = signedDelta(sat, target.s);
    const dL = signedDelta(lit, target.l);
    const dist = closeness(guess, target);

    const newGuess: Guess = {
      color: guess,
      deltaH: dH,
      deltaS: dS,
      deltaL: dL,
      distance: dist,
    };

    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    if (dist >= WIN_THRESHOLD) {
      setGameState("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
    }
  }, [gameState, hue, sat, lit, target, guesses]);

  // Scroll to bottom of guesses when a new guess is added
  useEffect(() => {
    if (guessListRef.current) {
      guessListRef.current.scrollTop = guessListRef.current.scrollHeight;
    }
  }, [guesses.length]);

  const buildShareText = useCallback(() => {
    const dots = guesses.map((g) => closenessEmoji(g.distance)).join("");
    const num = guesses.length;
    const result = gameState === "won" ? `${num}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return `Chroma #${activePuzzleIdx + 1} ${result}\n${dots}\nhttps://chroma.game`;
  }, [guesses, gameState, activePuzzleIdx]);

  const handleShare = useCallback(async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [buildShareText]);

  const resetForPuzzle = useCallback((idx: number) => {
    setActivePuzzleIdx(idx);
    setGuesses([]);
    setGameState("playing");
    setHue(180);
    setSat(50);
    setLit(50);
    setCopied(false);
  }, []);

  // Preview color
  const previewColor = hslToString({ h: hue, s: sat, l: lit });
  const targetColor = hslToString(target);

  // Hue gradient for the slider background
  const hueGradient =
    "linear-gradient(to right, hsl(0,80%,50%), hsl(60,80%,50%), hsl(120,80%,50%), hsl(180,80%,50%), hsl(240,80%,50%), hsl(300,80%,50%), hsl(360,80%,50%))";
  const satGradient = `linear-gradient(to right, hsl(${hue},0%,${lit}%), hsl(${hue},100%,${lit}%))`;
  const litGradient = `linear-gradient(to right, hsl(${hue},${sat}%,0%), hsl(${hue},${sat}%,50%), hsl(${hue},${sat}%,100%))`;

  const guessesRemaining = MAX_GUESSES - guesses.length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Custom slider styles */}
      <style>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0,0,0,0.2);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .slider-input::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0,0,0,0.2);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .slider-input:disabled::-webkit-slider-thumb {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .slider-input:disabled::-moz-range-thumb {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <nav className="mx-auto flex max-w-md items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPuzzleNav(!showPuzzleNav)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            #{activePuzzleIdx + 1}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
          >
            ?
          </button>
        </div>
      </nav>

      {/* Puzzle navigator (for testing all 5 puzzles) */}
      {showPuzzleNav && (
        <div className="mx-auto max-w-md px-6 pt-2">
          <div className="flex gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
            {PUZZLES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  resetForPuzzle(i);
                  setShowPuzzleNav(false);
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  i === activePuzzleIdx
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                #{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-md px-6 py-6">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Chroma
          </h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Guess the color in {MAX_GUESSES} tries
          </p>
        </div>

        {/* Target and preview swatches */}
        <div className="mb-5 flex items-center justify-center gap-4">
          <div className="text-center">
            <div
              className="h-20 w-20 rounded-xl border-2 border-zinc-200 shadow-sm dark:border-zinc-700"
              style={{ backgroundColor: targetColor }}
            />
            <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Target
            </span>
          </div>

          {gameState === "playing" && (
            <>
              <div className="text-xl text-zinc-300 dark:text-zinc-700">
                {"\u2192"}
              </div>
              <div className="text-center">
                <div
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-zinc-300 shadow-sm dark:border-zinc-600"
                  style={{ backgroundColor: previewColor }}
                />
                <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Your mix
                </span>
              </div>
            </>
          )}

          {gameState !== "playing" && guesses.length > 0 && (
            <>
              <div className="text-xl text-zinc-300 dark:text-zinc-700">
                {"\u2192"}
              </div>
              <div className="text-center">
                <div
                  className="h-20 w-20 rounded-xl border-2 border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{
                    backgroundColor: hslToString(
                      guesses[guesses.length - 1].color
                    ),
                  }}
                />
                <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {gameState === "won" ? "Matched!" : "Final"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Clue */}
        <div className="mb-5 text-center">
          <span className="italic text-zinc-400 dark:text-zinc-500">
            &ldquo;{activePuzzle.clue}&rdquo;
          </span>
        </div>

        {/* Sliders */}
        {gameState === "playing" && (
          <div className="mb-5">
            <ColorSlider
              label="Hue"
              value={hue}
              min={0}
              max={359}
              gradient={hueGradient}
              onChange={setHue}
              disabled={gameState !== "playing"}
            />
            <ColorSlider
              label="Saturation"
              value={sat}
              min={0}
              max={100}
              gradient={satGradient}
              onChange={setSat}
              disabled={gameState !== "playing"}
            />
            <ColorSlider
              label="Lightness"
              value={lit}
              min={0}
              max={100}
              gradient={litGradient}
              onChange={setLit}
              disabled={gameState !== "playing"}
            />
          </div>
        )}

        {/* Guess button */}
        {gameState === "playing" && (
          <button
            onClick={handleGuess}
            className="mb-5 w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
          >
            Submit Guess ({guessesRemaining} remaining)
          </button>
        )}

        {/* Guess history */}
        {guesses.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Guesses
            </h2>
            <div
              ref={guessListRef}
              className="flex max-h-[260px] flex-col gap-2 overflow-y-auto"
            >
              {guesses.map((g, i) => (
                <GuessRow key={i} guess={g} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Win state */}
        {gameState === "won" && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-800/50 dark:bg-emerald-900/20">
            <div className="mb-1 text-2xl">{"\u{1F3A8}"}</div>
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
              You found it!
            </h2>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              The color was <strong>{activePuzzle.name}</strong> in{" "}
              {guesses.length}/{MAX_GUESSES} {guesses.length === 1 ? "try" : "tries"}
            </p>
            <p className="mt-0.5 font-mono text-xs text-emerald-600 dark:text-emerald-500">
              hsl({target.h}, {target.s}%, {target.l}%)
            </p>
            <button
              onClick={handleShare}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        )}

        {/* Lose state */}
        {gameState === "lost" && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-800/50 dark:bg-red-900/20">
            <div className="mb-1 text-2xl">{"\u{1F62E}"}</div>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
              So close!
            </h2>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              The color was <strong>{activePuzzle.name}</strong>
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="text-center">
                <div
                  className="mx-auto h-12 w-12 rounded-lg border border-red-200 dark:border-red-800/50"
                  style={{ backgroundColor: targetColor }}
                />
                <span className="mt-1 block text-[10px] text-red-500 dark:text-red-400">
                  Target
                </span>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto h-12 w-12 rounded-lg border border-red-200 dark:border-red-800/50"
                  style={{
                    backgroundColor: hslToString(
                      guesses[guesses.length - 1].color
                    ),
                  }}
                />
                <span className="mt-1 block text-[10px] text-red-500 dark:text-red-400">
                  Closest
                </span>
              </div>
            </div>
            <p className="mt-2 font-mono text-xs text-red-500 dark:text-red-500">
              hsl({target.h}, {target.s}%, {target.l}%)
            </p>
            <button
              onClick={handleShare}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        )}

        {/* Bottom legend */}
        {gameState === "playing" && guesses.length === 0 && (
          <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Mix a color using the sliders above and submit your guess.
              <br />
              Feedback after each guess will guide you to the target.
            </p>
          </div>
        )}
      </main>

      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
