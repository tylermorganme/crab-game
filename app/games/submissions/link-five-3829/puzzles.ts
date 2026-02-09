export type Puzzle = {
  /** The 5-word chain in correct order. Each consecutive pair forms a compound word or common phrase. */
  chain: [string, string, string, string, string];
  /** 3 decoy words that don't belong in the chain */
  decoys: [string, string, string];
  /** Hint shown to explain the compound connections (revealed progressively) */
  connections: [string, string, string, string];
};

/**
 * 5 hand-crafted daily puzzles.
 * Each chain: word pairs form compound words.
 * e.g. BOOK->MARK = "bookmark", MARK->DOWN = "markdown", etc.
 */
export const PUZZLES: Puzzle[] = [
  {
    // bookmark, markdown, downtown, townhouse
    chain: ["BOOK", "MARK", "DOWN", "TOWN", "HOUSE"],
    decoys: ["SHELF", "CASE", "WORM"],
    connections: ["bookmark", "markdown", "downtown", "townhouse"],
  },
  {
    // backfire, fireside, sideline, lineup
    chain: ["BACK", "FIRE", "SIDE", "LINE", "UP"],
    decoys: ["DOOR", "YARD", "BONE"],
    connections: ["backfire", "fireside", "sideline", "lineup"],
  },
  {
    // headband, bandstand, standpoint, point-blank
    chain: ["HEAD", "BAND", "STAND", "POINT", "BLANK"],
    decoys: ["LIGHT", "FIRST", "MASTER"],
    connections: ["headband", "bandstand", "standpoint", "point-blank"],
  },
  {
    // raindrop, dropkick, kickback, backstage
    chain: ["RAIN", "DROP", "KICK", "BACK", "STAGE"],
    decoys: ["COAT", "FALL", "BOW"],
    connections: ["raindrop", "dropkick", "kickback", "backstage"],
  },
  {
    // nightfall, fallout, outline, lineup
    chain: ["NIGHT", "FALL", "OUT", "LINE", "UP"],
    decoys: ["CLUB", "SHIFT", "OWL"],
    connections: ["nightfall", "fallout", "outline", "lineup"],
  },
];
