"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const GRID = 5;
const MAX_ATTEMPTS = 6;

type Cell = [number, number];

function key(c: Cell): string {
  return `${c[0]},${c[1]}`;
}

function eq(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function adjacent(a: Cell, b: Cell): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function neighbors(c: Cell): Cell[] {
  return (
    [
      [c[0] - 1, c[1]],
      [c[0] + 1, c[1]],
      [c[0], c[1] - 1],
      [c[0], c[1] + 1],
    ] as Cell[]
  ).filter(([r, col]) => r >= 0 && r < GRID && col >= 0 && col < GRID);
}

// Seeded RNG
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// Generate a Hamiltonian path via randomized backtracking
function generateSolution(seed: number): Cell[] {
  const rand = rng(seed);
  const total = GRID * GRID;

  const startR = Math.floor(rand() * GRID);
  const startC = Math.floor(rand() * GRID);
  const start: Cell = [startR, startC];

  const visited = new Set<string>([key(start)]);
  const path: Cell[] = [start];

  function solve(): boolean {
    if (path.length === total) return true;
    const cur = path[path.length - 1];
    const nbrs = neighbors(cur).filter((n) => !visited.has(key(n)));
    // Shuffle
    for (let i = nbrs.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [nbrs[i], nbrs[j]] = [nbrs[j], nbrs[i]];
    }
    for (const n of nbrs) {
      const k = key(n);
      visited.add(k);
      path.push(n);
      if (solve()) return true;
      path.pop();
      visited.delete(k);
    }
    return false;
  }

  if (solve()) return path;

  // Fallback: snake
  const fallback: Cell[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      fallback.push([r, r % 2 === 0 ? c : GRID - 1 - c]);
    }
  }
  return fallback;
}

function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Convert path to set of segment keys for comparison
function segmentKey(a: Cell, b: Cell): string {
  const [a0, a1] = a;
  const [b0, b1] = b;
  if (a0 < b0 || (a0 === b0 && a1 < b1)) return `${a0},${a1}-${b0},${b1}`;
  return `${b0},${b1}-${a0},${a1}`;
}

function pathSegments(path: Cell[]): Set<string> {
  const segs = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    segs.add(segmentKey(path[i], path[i + 1]));
  }
  return segs;
}

type AttemptResult = {
  path: Cell[];
  correctSegments: number;
  totalSegments: number;
};

export default function DailyPathV1() {
  const solution = useMemo(() => generateSolution(getDailySeed()), []);
  const solutionSegments = useMemo(() => pathSegments(solution), [solution]);
  const start = solution[0];
  const end = solution[solution.length - 1];

  const [currentPath, setCurrentPath] = useState<Cell[]>([start]);
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  const [solved, setSolved] = useState(false);

  const currentVisited = useMemo(
    () => new Set(currentPath.map(key)),
    [currentPath]
  );

  const lastCell = currentPath[currentPath.length - 1];
  const isFull = currentPath.length === GRID * GRID;
  const attemptsLeft = MAX_ATTEMPTS - attempts.length;

  function handleCellClick(r: number, c: number) {
    if (solved || attemptsLeft <= 0) return;

    const cell: Cell = [r, c];

    // Undo last cell
    if (
      currentPath.length > 1 &&
      eq(cell, currentPath[currentPath.length - 1])
    ) {
      setCurrentPath((p) => p.slice(0, -1));
      return;
    }

    // Can't revisit
    if (currentVisited.has(key(cell))) return;

    // Must be adjacent to last cell
    if (!adjacent(lastCell, cell)) return;

    setCurrentPath((p) => [...p, cell]);
  }

  function handleSubmit() {
    if (!isFull || solved) return;

    const mySegments = pathSegments(currentPath);
    let correct = 0;
    for (const seg of mySegments) {
      if (solutionSegments.has(seg)) correct++;
    }

    const result: AttemptResult = {
      path: [...currentPath],
      correctSegments: correct,
      totalSegments: GRID * GRID - 1,
    };

    const newAttempts = [...attempts, result];
    setAttempts(newAttempts);

    if (correct === GRID * GRID - 1) {
      setSolved(true);
    } else {
      setCurrentPath([start]);
    }
  }

  function handleReset() {
    if (solved) return;
    setCurrentPath([start]);
  }

  function getShareText(): string {
    const day = getDailySeed();
    const attemptCount = attempts.length;
    const lines = attempts.map((a, i) => {
      const pct = Math.round((a.correctSegments / a.totalSegments) * 100);
      const filled = Math.round(pct / 5);
      const bar = "█".repeat(filled) + "░".repeat(20 - filled);
      const icon =
        i === attempts.length - 1 && solved
          ? "✅"
          : `${a.correctSegments}/${a.totalSegments}`;
      return `${bar} ${icon}`;
    });

    return `🔵 Daily Path #${day} ${solved ? attemptCount : "X"}/${MAX_ATTEMPTS}\n\n${lines.join("\n")}`;
  }

  function handleShare() {
    const text = getShareText();
    navigator.clipboard.writeText(text);
  }

  const gameOver = solved || attemptsLeft <= 0;

  // Find order index for each cell in current path
  const pathOrder = useMemo(() => {
    const map = new Map<string, number>();
    currentPath.forEach((c, i) => map.set(key(c), i));
    return map;
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <nav className="mx-auto max-w-md px-6 pt-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
      </nav>

      <main className="mx-auto max-w-md px-6 py-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daily Path
          </h1>
          <span className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
            v1
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Fill the entire 5&times;5 grid with a single path. Start at the green
          dot, end at the red dot.
        </p>

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            {attemptsLeft} attempts left
          </span>
          <span className="font-mono text-zinc-400 dark:text-zinc-500">
            {currentPath.length}/{GRID * GRID} cells
          </span>
        </div>

        {/* Grid */}
        <div className="mt-4 flex justify-center">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID * GRID }, (_, i) => {
              const r = Math.floor(i / GRID);
              const c = i % GRID;
              const cell: Cell = [r, c];
              const k = key(cell);
              const isStart = eq(cell, start);
              const isEnd = eq(cell, end);
              const isInPath = currentVisited.has(k);
              const isLast = eq(cell, lastCell);
              const order = pathOrder.get(k);
              const canClick =
                !gameOver &&
                (adjacent(lastCell, cell) || (isLast && currentPath.length > 1));

              return (
                <button
                  key={k}
                  onClick={() => handleCellClick(r, c)}
                  disabled={gameOver}
                  className={`
                    flex h-14 w-14 items-center justify-center rounded-md
                    text-sm font-mono transition-colors
                    ${
                      isInPath
                        ? isStart
                          ? "bg-emerald-500 text-white"
                          : isEnd && isFull
                            ? "bg-red-500 text-white"
                            : isLast
                              ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900"
                              : "bg-zinc-300 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300"
                        : isEnd
                          ? "bg-red-100 text-red-400 dark:bg-red-950 dark:text-red-400"
                          : canClick
                            ? "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
                            : "bg-zinc-100 dark:bg-zinc-800"
                    }
                    ${isStart ? "ring-2 ring-emerald-400" : ""}
                    ${isEnd && !isInPath ? "ring-2 ring-red-300 dark:ring-red-700" : ""}
                  `}
                >
                  {isStart && !isInPath
                    ? "S"
                    : isEnd && !isInPath
                      ? "E"
                      : isInPath
                        ? order !== undefined
                          ? order + 1
                          : ""
                        : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex gap-3">
          {!gameOver && (
            <>
              <button
                onClick={handleReset}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFull}
                className={`
                  rounded-md px-4 py-2 text-sm font-medium
                  ${
                    isFull
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                  }
                `}
              >
                Submit
              </button>
            </>
          )}
          {gameOver && (
            <button
              onClick={handleShare}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Share
            </button>
          )}
        </div>

        {/* Attempt History */}
        {attempts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Attempts
            </h2>
            <div className="mt-2 flex flex-col gap-2">
              {attempts.map((a, i) => {
                const pct = Math.round(
                  (a.correctSegments / a.totalSegments) * 100
                );
                const isWin =
                  i === attempts.length - 1 &&
                  a.correctSegments === a.totalSegments;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-4 text-right font-mono text-xs text-zinc-400">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className={`h-3 rounded-full transition-all ${isWin ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {a.correctSegments}/{a.totalSegments}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result message */}
        {solved && (
          <p className="mt-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Solved in {attempts.length} attempt{attempts.length > 1 ? "s" : ""}!
          </p>
        )}
        {!solved && attemptsLeft <= 0 && (
          <p className="mt-6 text-center text-sm font-medium text-red-600 dark:text-red-400">
            Out of attempts. Better luck tomorrow.
          </p>
        )}
      </main>
    </div>
  );
}
