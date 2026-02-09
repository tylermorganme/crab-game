import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Turso DB for pre-computed rankings
const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

// Secret words — one per day, cycling
const SECRET_WORDS = [
  "lighthouse", "volcano", "whisper", "telescope", "carnival",
  "anchor", "glacier", "compass", "lantern", "thunder",
  "orchard", "phantom", "sapphire", "labyrinth", "eclipse",
  "cathedral", "driftwood", "mirage", "fortress", "avalanche",
  "silhouette", "mosaic", "pendulum", "horizon", "ember",
  "cascade", "obsidian", "chimera", "tundra", "corridor",
];

function getTodaysWord(): string {
  const epoch = new Date("2026-02-09").getTime();
  const now = new Date().getTime();
  const dayIndex = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  return SECRET_WORDS[((dayIndex % SECRET_WORDS.length) + SECRET_WORDS.length) % SECRET_WORDS.length];
}

function similarityToTemperature(sim: number): string {
  if (sim >= 0.55) return "on fire";
  if (sim >= 0.45) return "hot";
  if (sim >= 0.38) return "warm";
  if (sim >= 0.30) return "tepid";
  if (sim >= 0.23) return "cold";
  return "freezing";
}

function isValidWord(word: string): boolean {
  return /^[a-zA-Z]{1,30}$/.test(word.trim());
}

// Fallback: OpenAI embeddings
const embeddingCache = new Map<string, number[]>();

async function getEmbedding(word: string): Promise<number[]> {
  if (embeddingCache.has(word)) return embeddingCache.get(word)!;
  const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: word });
  const vec = res.data[0].embedding;
  embeddingCache.set(word, vec);
  return vec;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; nA += a[i] * a[i]; nB += b[i] * b[i]; }
  return dot / (Math.sqrt(nA) * Math.sqrt(nB));
}

export async function POST(request: NextRequest) {
  try {
    const { guess } = await request.json();

    if (!guess || typeof guess !== "string") {
      return NextResponse.json({ error: "Missing guess" }, { status: 400 });
    }

    const cleaned = guess.toLowerCase().trim();

    if (!isValidWord(cleaned)) {
      return NextResponse.json(
        { error: "Please enter a single English word (letters only)" },
        { status: 400 }
      );
    }

    const secretWord = getTodaysWord();

    if (cleaned === secretWord) {
      return NextResponse.json({
        guess: cleaned, similarity: 1.0, rank: 0, totalWords: 192959,
        temperature: "correct", won: true,
      });
    }

    // Try Turso lookup
    const result = await turso.execute({
      sql: `SELECT rank, similarity FROM rankings WHERE secret_word = ? AND word = ?`,
      args: [secretWord, cleaned],
    });

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return NextResponse.json({
        guess: cleaned,
        similarity: row.similarity as number,
        rank: row.rank as number,
        totalWords: 192959,
        temperature: similarityToTemperature(row.similarity as number),
        won: false,
      });
    }

    // Fallback: live OpenAI embedding for words not in vocab
    const [guessVec, secretVec] = await Promise.all([
      getEmbedding(cleaned),
      getEmbedding(secretWord),
    ]);
    const similarity = cosineSimilarity(guessVec, secretVec);

    return NextResponse.json({
      guess: cleaned,
      similarity: Math.round(similarity * 10000) / 10000,
      rank: null,
      totalWords: 192959,
      temperature: similarityToTemperature(similarity),
      won: false,
    });
  } catch (err: unknown) {
    console.error("Hot/cold API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
