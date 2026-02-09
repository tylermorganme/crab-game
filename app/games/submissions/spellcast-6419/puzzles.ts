// 6 rune types -- each has a symbol (unicode), a name, and a color
export const RUNES = [
  { id: 0, symbol: "\u25C6", name: "Ember", color: "#ef4444" },      // red diamond
  { id: 1, symbol: "\u2736", name: "Frost", color: "#3b82f6" },      // blue star
  { id: 2, symbol: "\u25B2", name: "Gale", color: "#22c55e" },       // green triangle
  { id: 3, symbol: "\u25CF", name: "Stone", color: "#a855f7" },      // purple circle
  { id: 4, symbol: "\u2B23", name: "Void", color: "#f59e0b" },       // amber hexagon
  { id: 5, symbol: "\u25A0", name: "Flux", color: "#ec4899" },       // pink square
] as const;

export type RuneId = 0 | 1 | 2 | 3 | 4 | 5;

export type Puzzle = {
  id: number;
  answer: [RuneId, RuneId, RuneId, RuneId];
  flavorTitle: string;
  flavorHint: string;
};

// 5 hand-crafted daily puzzles
// answer is [slot0, slot1, slot2, slot3]
// 6^4 = 1296 possibilities per puzzle
export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    answer: [2, 0, 5, 1],   // Gale, Ember, Flux, Frost
    flavorTitle: "The Waking Storm",
    flavorHint: "Wind begins, fire follows, chaos blooms, and cold closes.",
  },
  {
    id: 2,
    answer: [3, 4, 0, 3],   // Stone, Void, Ember, Stone
    flavorTitle: "The Sealed Gate",
    flavorHint: "Anchored twice, hollowed once, and sparked between.",
  },
  {
    id: 3,
    answer: [1, 5, 3, 2],   // Frost, Flux, Stone, Gale
    flavorTitle: "The Shifting Glyph",
    flavorHint: "Ice turns to chaos, earth rises, and wind carries it away.",
  },
  {
    id: 4,
    answer: [4, 2, 1, 0],   // Void, Gale, Frost, Ember
    flavorTitle: "The Hollow Flame",
    flavorHint: "Emptiness gives way to motion, chill, then heat.",
  },
  {
    id: 5,
    answer: [5, 3, 4, 5],   // Flux, Stone, Void, Flux
    flavorTitle: "The Twin Eclipse",
    flavorHint: "Chaos frames the spell — steady earth and hollow space between.",
  },
];

export const MAX_GUESSES = 8;
export const CODE_LENGTH = 4;

export type Feedback = "correct" | "misplaced" | "wrong";

/**
 * Evaluate a guess against the answer.
 * Returns an array of feedback per position, PLUS summary counts.
 *
 * Algorithm (standard Mastermind scoring):
 * 1. First pass: mark exact matches (correct)
 * 2. Second pass: mark misplaced (correct rune, wrong position)
 * 3. Everything else is wrong
 */
export function evaluateGuess(
  guess: RuneId[],
  answer: RuneId[]
): { perSlot: Feedback[]; correctCount: number; misplacedCount: number } {
  const perSlot: Feedback[] = Array(CODE_LENGTH).fill("wrong");
  const answerUsed: boolean[] = Array(CODE_LENGTH).fill(false);
  const guessUsed: boolean[] = Array(CODE_LENGTH).fill(false);

  let correctCount = 0;
  let misplacedCount = 0;

  // First pass: exact matches
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      perSlot[i] = "correct";
      answerUsed[i] = true;
      guessUsed[i] = true;
      correctCount++;
    }
  }

  // Second pass: misplaced
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < CODE_LENGTH; j++) {
      if (answerUsed[j]) continue;
      if (guess[i] === answer[j]) {
        perSlot[i] = "misplaced";
        answerUsed[j] = true;
        guessUsed[i] = true;
        misplacedCount++;
        break;
      }
    }
  }

  return { perSlot, correctCount, misplacedCount };
}
