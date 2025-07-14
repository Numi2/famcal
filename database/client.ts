import initSqlJs from "sql.js"
import { drizzle } from "drizzle-orm/sqlite-wasm"
import * as schema from "./schema"

// NOTE: sql.js expects to fetch its wasm file; using CDN for PoC.
const locateFile = (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`

let dbPromise: ReturnType<typeof drizzle> | null = null

export async function getDb() {
  if (dbPromise) return dbPromise

  const SQL = await initSqlJs({ locateFile })
  const sqliteDb = new SQL.Database() // in-memory; sql.js can persist to IndexedDB later
  // Ensure table exists (simple PoC schema)
  sqliteDb.exec(`CREATE TABLE IF NOT EXISTS family_member (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    age INTEGER,
    color TEXT,
    grade TEXT,
    school TEXT
  );`)
  dbPromise = drizzle(sqliteDb, { schema })

  // Seed sample data once (idempotent insert)
  import("./seed").then(({ seedFamilyMembers }) => {
    seedFamilyMembers().catch(console.error)
  })

  return dbPromise
}