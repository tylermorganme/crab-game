import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";

const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
const local = new Database(path.join(process.cwd(), "data", "rankings.db"), { readonly: true });

async function main() {
  console.log("Dropping + recreating table...");
  await turso.execute(`DROP TABLE IF EXISTS rankings`);
  await turso.execute(`
    CREATE TABLE rankings (
      secret_word TEXT NOT NULL,
      word TEXT NOT NULL,
      rank INTEGER NOT NULL,
      similarity REAL NOT NULL
    )
  `);

  const secrets = local.prepare(`SELECT DISTINCT secret_word FROM rankings`).all();
  console.log(`${secrets.length} secret words to upload`);

  // Use multi-value INSERT for speed: INSERT INTO t VALUES (...), (...), (...)
  const ROWS_PER_INSERT = 200; // bigger multi-value inserts
  const BATCH_SIZE = 10; // number of INSERT statements per turso batch call

  for (const { secret_word } of secrets) {
    const rows = local.prepare(
      `SELECT word, rank, similarity FROM rankings WHERE secret_word = ? ORDER BY rank`
    ).all(secret_word);

    console.log(`Uploading "${secret_word}" (${rows.length} rows)...`);
    const startTime = Date.now();

    // Build multi-value INSERT statements
    const stmts = [];
    for (let i = 0; i < rows.length; i += ROWS_PER_INSERT) {
      const chunk = rows.slice(i, i + ROWS_PER_INSERT);
      const placeholders = chunk.map(() => `(?, ?, ?, ?)`).join(", ");
      const args = [];
      for (const r of chunk) {
        args.push(secret_word, r.word, r.rank, r.similarity);
      }
      stmts.push({ sql: `INSERT INTO rankings VALUES ${placeholders}`, args });
    }

    // Send batches of INSERT statements
    for (let i = 0; i < stmts.length; i += BATCH_SIZE) {
      const batch = stmts.slice(i, i + BATCH_SIZE);
      await turso.batch(batch);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Done in ${elapsed}s`);
  }

  console.log("\nCreating index...");
  await turso.execute(`CREATE INDEX idx_lookup ON rankings (secret_word, word)`);
  console.log("Done!");
}

main().catch(console.error);
