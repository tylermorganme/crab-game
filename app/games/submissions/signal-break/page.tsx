"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, useEffect } from "react";

// ─── Types & Constants ───────────────────────────────────────────────────────

const SYMBOLS = ["circle", "triangle", "square", "diamond", "star", "hex"] as const;
type Sym = (typeof SYMBOLS)[number];

const GLYPH: Record<Sym, string> = {
  circle: "\u25CF",
  triangle: "\u25B2",
  square: "\u25A0",
  diamond: "\u25C6",
  star: "\u2605",
  hex: "\u2B22",
};

const SYM_BG: Record<Sym, string> = {
  circle: "bg-rose-500 dark:bg-rose-400",
  triangle: "bg-amber-500 dark:bg-amber-400",
  square: "bg-emerald-500 dark:bg-emerald-400",
  diamond: "bg-sky-500 dark:bg-sky-400",
  star: "bg-violet-500 dark:bg-violet-400",
  hex: "bg-orange-500 dark:bg-orange-400",
};

const SYM_PALETTE_BG: Record<Sym, string> = {
  circle: "bg-rose-100 dark:bg-rose-900/50",
  triangle: "bg-amber-100 dark:bg-amber-900/50",
  square: "bg-emerald-100 dark:bg-emerald-900/50",
  diamond: "bg-sky-100 dark:bg-sky-900/50",
  star: "bg-violet-100 dark:bg-violet-900/50",
  hex: "bg-orange-100 dark:bg-orange-900/50",
};

const SYM_TEXT: Record<Sym, string> = {
  circle: "text-rose-600 dark:text-rose-300",
  triangle: "text-amber-600 dark:text-amber-300",
  square: "text-emerald-600 dark:text-emerald-300",
  diamond: "text-sky-600 dark:text-sky-300",
  star: "text-violet-600 dark:text-violet-300",
  hex: "text-orange-600 dark:text-orange-300",
};

const SHARE_EMOJI: Record<Sym, string> = {
  circle: "\uD83D\uDD34",
  triangle: "\uD83D\uDD36",
  square: "\uD83D\uDFE9",
  diamond: "\uD83D\uDD37",
  star: "\uD83D\uDFEA",
  hex: "\uD83D\uDFE7",
};

const CODE_LEN = 4;
const MAX_GUESSES = 6;
const TOTAL_COMBOS = 1296; // 6^4

// ─── 5 Baked-in Puzzles ──────────────────────────────────────────────────────

const PUZZLES: Sym[][] = [
  ["star", "circle", "triangle", "hex"],
  ["diamond", "square", "diamond", "circle"],
  ["triangle", "hex", "star", "square"],
  ["circle", "circle", "diamond", "triangle"],
  ["hex", "star", "square", "star"],
];

// ─── Mastermind Feedback ─────────────────────────────────────────────────────

interface Feedback {
  exact: number;
  misplaced: number;
}

function score(guess: Sym[], secret: Sym[]): Feedback {
  let exact = 0;
  const sRem: (Sym | null)[] = [...secret];
  const gRem: (Sym | null)[] = [...guess];

  for (let i = 0; i < CODE_LEN; i++) {
    if (guess[i] === secret[i]) {
      exact++;
      sRem[i] = null;
      gRem[i] = null;
    }
  }

  let misplaced = 0;
  for (let i = 0; i < CODE_LEN; i++) {
    if (gRem[i] === null) continue;
    const j = sRem.indexOf(gRem[i]);
    if (j !== -1) {
      misplaced++;
      sRem[j] = null;
    }
  }

  return { exact, misplaced };
}

// ─── Possibility Counter ─────────────────────────────────────────────────────

function countRemaining(history: { guess: Sym[]; fb: Feedback }[]): number {
  if (history.length === 0) return TOTAL_COMBOS;
  let n = 0;
  for (let a = 0; a < 6; a++)
    for (let b = 0; b < 6; b++)
      for (let c = 0; c < 6; c++)
        for (let d = 0; d < 6; d++) {
          const c4: Sym[] = [SYMBOLS[a], SYMBOLS[b], SYMBOLS[c], SYMBOLS[d]];
          let ok = true;
          for (const h of history) {
            const f = score(h.guess, c4);
            if (f.exact !== h.fb.exact || f.misplaced !== h.fb.misplaced) {
              ok = false;
              break;
            }
          }
          if (ok) n++;
        }
  return n;
}

// ─── Game State Types ────────────────────────────────────────────────────────

interface Row {
  guess: Sym[];
  fb: Feedback;
  remaining: number;
}

type Phase = "playing" | "won" | "lost";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SignalBreak() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [slots, setSlots] = useState<(Sym | null)[]>([null, null, null, null]);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  const secret = PUZZLES[puzzleIdx];

  // Hydration guard
  useEffect(() => {
    const saved = localStorage.getItem("signal-break-pidx");
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < PUZZLES.length) setPuzzleIdx(idx);
    }
    setReady(true);
  }, []);

  // Current remaining (live, before submitting)
  const currentRemaining = useMemo(() => {
    if (rows.length === 0) return TOTAL_COMBOS;
    return rows[rows.length - 1].remaining;
  }, [rows]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const pickSymbol = useCallback(
    (sym: Sym) => {
      if (phase !== "playing") return;
      setSlots((prev) => {
        const next = [...prev];
        next[cursor] = sym;
        return next;
      });
      setCursor((c) => Math.min(c + 1, CODE_LEN - 1));
    },
    [phase, cursor]
  );

  const tapSlot = useCallback(
    (idx: number) => {
      if (phase !== "playing") return;
      if (slots[idx] !== null) {
        // Clear it
        setSlots((prev) => {
          const next = [...prev];
          next[idx] = null;
          return next;
        });
      }
      setCursor(idx);
    },
    [phase, slots]
  );

  const submit = useCallback(() => {
    if (phase !== "playing") return;
    if (slots.some((s) => s === null)) return;

    const guess = slots as Sym[];
    const fb = score(guess, secret);
    const hist = [...rows.map((r) => ({ guess: r.guess, fb: r.fb })), { guess, fb }];
    const rem = countRemaining(hist);
    const newRows = [...rows, { guess, fb, remaining: rem }];
    setRows(newRows);
    setSlots([null, null, null, null]);
    setCursor(0);

    if (fb.exact === CODE_LEN) {
      setPhase("won");
    } else if (newRows.length >= MAX_GUESSES) {
      setPhase("lost");
    }
  }, [phase, slots, secret, rows]);

  const resetGame = useCallback((idx: number) => {
    setPuzzleIdx(idx);
    localStorage.setItem("signal-break-pidx", String(idx));
    setRows([]);
    setSlots([null, null, null, null]);
    setCursor(0);
    setPhase("playing");
    setCopied(false);
  }, []);

  // ─── Share ─────────────────────────────────────────────────────────────────

  const shareText = useMemo(() => {
    const num = puzzleIdx + 1;
    const result = phase === "won" ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    let txt = `Signal Break #${num} ${result}\n\n`;

    for (const row of rows) {
      const syms = row.guess.map((s) => SHARE_EMOJI[s]).join("");
      const pegs =
        "\u26AB".repeat(row.fb.exact) +
        "\u26AA".repeat(row.fb.misplaced) +
        "\u2B1C".repeat(CODE_LEN - row.fb.exact - row.fb.misplaced);
      txt += `${syms} ${pegs}\n`;
    }

    return txt.trimEnd();
  }, [rows, phase, puzzleIdx]);

  const copyShare = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [shareText]);

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "playing") return;
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        setSlots((prev) => {
          const next = [...prev];
          if (next[cursor] !== null) {
            next[cursor] = null;
          } else if (cursor > 0) {
            next[cursor - 1] = null;
            setCursor(cursor - 1);
          }
          return next;
        });
        return;
      }
      if (e.key === "ArrowLeft") {
        setCursor((c) => Math.max(0, c - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        setCursor((c) => Math.min(CODE_LEN - 1, c + 1));
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) pickSymbol(SYMBOLS[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, submit, cursor, pickSymbol]);

  // ─── Signal bar ────────────────────────────────────────────────────────────

  const signalPct = Math.max(1, ((TOTAL_COMBOS - currentRemaining) / TOTAL_COMBOS) * 100);
  const barColor =
    currentRemaining <= 1
      ? "#22c55e"
      : currentRemaining <= 10
        ? "#84cc16"
        : currentRemaining <= 50
          ? "#eab308"
          : currentRemaining <= 200
            ? "#f97316"
            : "#ef4444";

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <nav className="mx-auto max-w-md px-6 pt-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
            &larr; Back
          </Link>
        </nav>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950 select-none">
      {/* Nav */}
      <nav className="mx-auto max-w-md px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          &larr; Back
        </Link>
        <button
          type="button"
          onClick={() => setRulesOpen((v) => !v)}
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {rulesOpen ? "Hide Rules" : "How to Play"}
        </button>
      </nav>

      <main className="mx-auto max-w-md px-6 py-5">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Signal Break
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Puzzle #{puzzleIdx + 1} of {PUZZLES.length}
          </p>
        </div>

        {/* Rules */}
        {rulesOpen && (
          <div className="mb-5 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              Crack the hidden 4-symbol code in 6 guesses.
            </p>
            <p>
              Choose from 6 symbols. Symbols can repeat. After each guess:
            </p>
            <div className="space-y-1.5 pl-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-zinc-800 dark:bg-zinc-100 shrink-0" />
                <span>Correct symbol in the correct position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                <span>Correct symbol but wrong position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                <span>Symbol not in the code</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1 italic">
              The signal bar shows how many possibilities remain. Use logic to
              collapse 1,296 down to 1.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Keyboard: 1-6 pick symbols, arrows move, Backspace clears, Enter submits.
            </p>
          </div>
        )}

        {/* Signal Lock Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Signal Lock</span>
            <span className="tabular-nums font-mono text-zinc-400 dark:text-zinc-500">
              {currentRemaining <= 1
                ? "LOCKED"
                : `${currentRemaining.toLocaleString()} left`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${signalPct}%`, background: barColor }}
            />
          </div>
        </div>

        {/* Guess History */}
        <div className="space-y-2 mb-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-center gap-3">
              {/* Symbols */}
              <div className="flex gap-1.5">
                {row.guess.map((sym, j) => (
                  <div
                    key={j}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg text-white ${SYM_BG[sym]}`}
                  >
                    {GLYPH[sym]}
                  </div>
                ))}
              </div>
              {/* Feedback pegs */}
              <div className="flex gap-1">
                {Array.from({ length: row.fb.exact }, (_, k) => (
                  <div key={`e${k}`} className="w-3.5 h-3.5 rounded-full bg-zinc-800 dark:bg-zinc-100" />
                ))}
                {Array.from({ length: row.fb.misplaced }, (_, k) => (
                  <div key={`m${k}`} className="w-3.5 h-3.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                ))}
                {Array.from({ length: CODE_LEN - row.fb.exact - row.fb.misplaced }, (_, k) => (
                  <div key={`n${k}`} className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />
                ))}
              </div>
              {/* Remaining count */}
              <span className="text-[10px] font-mono tabular-nums text-zinc-400 dark:text-zinc-600 w-8 text-right">
                {row.remaining}
              </span>
            </div>
          ))}
        </div>

        {/* Current Input Row */}
        {phase === "playing" && (
          <div className="mb-2">
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                {slots.map((sym, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => tapSlot(i)}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg transition-all
                      ${sym
                        ? `text-white ${SYM_BG[sym]} ${
                            i === cursor ? "ring-2 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-950 ring-zinc-600 dark:ring-zinc-300 scale-110" : ""
                          }`
                        : i === cursor
                          ? "bg-zinc-300 dark:bg-zinc-600 ring-2 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-950 ring-zinc-500 dark:ring-zinc-400 scale-110"
                          : "bg-zinc-200 dark:bg-zinc-800"
                      }`}
                  >
                    {sym ? GLYPH[sym] : ""}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: CODE_LEN }, (_, k) => (
                  <div key={k} className="w-3.5 h-3.5 rounded-full border border-zinc-200 dark:border-zinc-800" />
                ))}
              </div>
              <span className="w-8" />
            </div>
            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
              Guess {rows.length + 1} of {MAX_GUESSES}
            </p>
          </div>
        )}

        {/* Future empty rows */}
        {phase === "playing" && (
          <div className="space-y-2 mb-5">
            {Array.from({ length: MAX_GUESSES - rows.length - 1 }, (_, i) => (
              <div key={i} className="flex items-center justify-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: CODE_LEN }, (_, j) => (
                    <div key={j} className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: CODE_LEN }, (_, k) => (
                    <div key={k} className="w-3.5 h-3.5 rounded-full border border-zinc-200 dark:border-zinc-800" />
                  ))}
                </div>
                <span className="w-8" />
              </div>
            ))}
          </div>
        )}

        {/* Symbol Palette */}
        {phase === "playing" && (
          <div className="mb-4">
            <div className="flex gap-2 justify-center">
              {SYMBOLS.map((sym, idx) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => pickSymbol(sym)}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-lg transition-transform active:scale-90 ${SYM_PALETTE_BG[sym]} ${SYM_TEXT[sym]}`}
                >
                  <span className="leading-none font-bold">{GLYPH[sym]}</span>
                  <span className="text-[9px] opacity-50 font-mono mt-0.5">{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {phase === "playing" && (
          <div className="flex justify-center mb-5">
            <button
              type="button"
              onClick={submit}
              disabled={slots.some((s) => s === null)}
              className="px-10 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95
                bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900
                hover:bg-zinc-700 dark:hover:bg-zinc-200
                disabled:bg-zinc-200 dark:disabled:bg-zinc-800
                disabled:text-zinc-400 dark:disabled:text-zinc-600
                disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
          </div>
        )}

        {/* ─── End State ──────────────────────────────────────────── */}
        {phase !== "playing" && (
          <div className="text-center mt-4 mb-6">
            {phase === "won" ? (
              <>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                  Signal Decoded
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  {rows.length === 1
                    ? "First try. Extraordinary."
                    : rows.length === 2
                      ? "Two guesses. Brilliant."
                      : rows.length <= 4
                        ? `Cracked in ${rows.length}. Well played.`
                        : `Solved in ${rows.length}. Nerves of steel.`}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                  Signal Lost
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  The code was:
                </p>
                <div className="flex gap-1.5 justify-center mb-4">
                  {secret.map((sym, i) => (
                    <div
                      key={i}
                      className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg text-white ${SYM_BG[sym]}`}
                    >
                      {GLYPH[sym]}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Share button */}
            <button
              type="button"
              onClick={copyShare}
              className="px-8 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95
                bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900
                hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>

            {/* Share preview */}
            <div className="mt-4 mx-auto max-w-xs">
              <button type="button" onClick={copyShare} className="w-full text-left">
                <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 overflow-x-auto whitespace-pre font-mono leading-relaxed">
                  {shareText}
                </pre>
              </button>
            </div>

            {/* Puzzle picker */}
            <div className="mt-6">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
                Play another puzzle
              </p>
              <div className="flex gap-2 justify-center">
                {PUZZLES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => resetGame(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                      ${i === puzzleIdx
                        ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Puzzle switcher during play */}
        {phase === "playing" && (
          <div className="text-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Puzzles</p>
            <div className="flex gap-2 justify-center">
              {PUZZLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => resetGame(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                    ${i === puzzleIdx
                      ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
