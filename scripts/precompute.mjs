import OpenAI from "openai";
import Database from "better-sqlite3";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const allWords = require("an-array-of-english-words");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Config ---
const SECRET_WORDS = [
  "lighthouse", "volcano", "whisper", "telescope", "carnival",
  "anchor", "glacier", "compass", "lantern", "thunder",
  "orchard", "phantom", "sapphire", "labyrinth", "eclipse",
  "cathedral", "driftwood", "mirage", "fortress", "avalanche",
  "silhouette", "mosaic", "pendulum", "horizon", "ember",
  "cascade", "obsidian", "chimera", "tundra", "corridor",
];

const DB_PATH = path.join(process.cwd(), "data", "rankings.db");
const BATCH_SIZE = 2048;

// --- Build vocab: ~20K common words, 3-10 chars ---
function buildVocab() {
  const filtered = allWords.filter((w) => /^[a-z]{3,10}$/.test(w));
  const vocab = filtered.sort((a, b) => a.localeCompare(b));

  // Ensure secret words are included
  for (const sw of SECRET_WORDS) {
    if (!vocab.includes(sw)) vocab.push(sw);
  }
  return [...new Set(vocab)];
}

// --- Embed in batches ---
async function embedAll(words) {
  const embeddings = new Array(words.length);
  const totalBatches = Math.ceil(words.length / BATCH_SIZE);

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} words)...`);
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    for (let j = 0; j < res.data.length; j++) {
      embeddings[i + j] = res.data[j].embedding;
    }
  }
  return embeddings;
}

// --- Cosine similarity ---
function cosine(a, b) {
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    nA += a[i] * a[i];
    nB += b[i] * b[i];
  }
  return dot / (Math.sqrt(nA) * Math.sqrt(nB));
}

// --- Main ---
async function main() {
  console.log("Building vocab...");
  const vocab = buildVocab();
  console.log(`Vocab: ${vocab.length} words`);

  console.log("\nEmbedding vocab...");
  const vocabEmbeddings = await embedAll(vocab);

  // Setup SQLite
  console.log("\nCreating database...");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`DROP TABLE IF EXISTS rankings`);
  db.exec(`
    CREATE TABLE rankings (
      secret_word TEXT NOT NULL,
      word TEXT NOT NULL,
      rank INTEGER NOT NULL,
      similarity REAL NOT NULL
    )
  `);

  const insert = db.prepare(
    `INSERT INTO rankings (secret_word, word, rank, similarity) VALUES (?, ?, ?, ?)`
  );

  // For each secret word, compute + insert rankings
  for (const secret of SECRET_WORDS) {
    console.log(`\nRanking "${secret}"...`);
    const secretIdx = vocab.indexOf(secret);
    const secretVec = vocabEmbeddings[secretIdx];

    // Compute similarities
    const scores = [];
    for (let i = 0; i < vocab.length; i++) {
      if (vocab[i] === secret) continue;
      scores.push({
        word: vocab[i],
        sim: Math.round(cosine(secretVec, vocabEmbeddings[i]) * 10000) / 10000,
      });
    }

    // Sort descending
    scores.sort((a, b) => b.sim - a.sim);

    // Batch insert in a transaction
    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(row.secret, row.word, row.rank, row.sim);
    });

    const rows = scores.map((s, i) => ({
      secret,
      word: s.word,
      rank: i + 1,
      sim: s.sim,
    }));

    insertMany(rows);
    console.log(`  Inserted ${rows.length} rows. Top: ${scores[0].word} (${scores[0].sim})`);
  }

  // Create index for fast lookups
  console.log("\nCreating index...");
  db.exec(`CREATE INDEX idx_lookup ON rankings (secret_word, word)`);

  // Compact
  db.pragma("wal_checkpoint(TRUNCATE)");
  db.close();

  // Report file size
  const { statSync } = await import("fs");
  const size = statSync(DB_PATH).size;
  console.log(`\nDone! DB size: ${(size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(console.error);
