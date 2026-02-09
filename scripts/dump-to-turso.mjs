import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";

const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Set TURSO_URL and TURSO_TOKEN");
  process.exit(1);
}

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
const local = new Database(path.join(process.cwd(), "data", "rankings.db"), { readonly: true });

async function main() {
  console.log("Creating table on Turso...");
  await turso.execute(`DROP TABLE IF EXISTS rankings`);
  await turso.execute(`
    CREATE TABLE rankings (
      secret_word TEXT NOT NULL,
      word TEXT NOT NULL,
      rank INTEGER NOT NULL,
      similarity REAL NOT NULL
    )
  `);

  // Get all secret words
  const secrets = local.prepare(`SELECT DISTINCT secret_word FROM rankings`).all();
  console.log(`Found ${secrets.length} secret words`);

  for (const { secret_word } of secrets) {
    console.log(`Uploading "${secret_word}"...`);
    const rows = local.prepare(
      `SELECT word, rank, similarity FROM rankings WHERE secret_word = ?`
    ).all(secret_word);

    // Batch insert in chunks of 500 (Turso batch limit)
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const stmts = chunk.map((r) => ({
        sql: `INSERT INTO rankings (secret_word, word, rank, similarity) VALUES (?, ?, ?, ?)`,
        args: [secret_word, r.word, r.rank, r.similarity],
      }));
      await turso.batch(stmts);
      if ((i / CHUNK) % 20 === 0) {
        process.stdout.write(`  ${i + chunk.length}/${rows.length}\r`);
      }
    }
    console.log(`  Done: ${rows.length} rows`);
  }

  console.log("\nCreating index...");
  await turso.execute(`CREATE INDEX idx_lookup ON rankings (secret_word, word)`);

  console.log("Done!");
  local.close();
}

main().catch(console.error);
