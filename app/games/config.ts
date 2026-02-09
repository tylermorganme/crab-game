export type GameVersion = {
  version: string;
  date: string;
  notes: string;
};

export type GameConfig = {
  id: string;
  name: string;
  description: string;
  idea: number;
  versions: GameVersion[];
};

export const games: GameConfig[] = [
  {
    id: "image-reveal",
    name: "Image Reveal",
    description: "Guess what's in a partially hidden image",
    idea: 1,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "sound-reveal",
    name: "Sound Reveal",
    description: "Guess the song/sound from an extending clip",
    idea: 2,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "pattern-sequence",
    name: "Pattern Sequence",
    description: "Predict the next element in a sequence",
    idea: 3,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "daily-maze",
    name: "Daily Maze",
    description: "Find the exit with limited vision",
    idea: 4,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "connections",
    name: "Connections",
    description: "Find the hidden connection between items",
    idea: 5,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "spot-the-difference",
    name: "Spot the Difference",
    description: "Find differences with progressive hints",
    idea: 6,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "action-gauntlet",
    name: "Action Gauntlet",
    description: "Complete a 90-second obstacle course in limited attempts",
    idea: 7,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "daily-path",
    name: "Daily Path",
    description: "Find the hidden path through a grid of dots",
    idea: 8,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
  {
    id: "drawing-reveal",
    name: "Drawing Reveal",
    description: "Draw on a hidden image, get feedback on closeness",
    idea: 10,
    versions: [{ version: "v1", date: "2026-02-05", notes: "Initial placeholder" }],
  },
];
