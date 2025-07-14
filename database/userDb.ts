import initSqlJs from "sql.js"
import { drizzle } from "drizzle-orm/sql-js"
import * as schema from "./schema"
import { seedFamilyMembers } from "./seed"

// Helper to base64 encode Uint8Array
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const locateFile = (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`

export async function getUserDb(userId: string) {
  const SQL = await initSqlJs({ locateFile })
  const storageKey = `familyDb_${userId}`
  let sqliteDb

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      const bytes = base64ToUint8(stored)
      sqliteDb = new SQL.Database(bytes)
    }
  }

  if (!sqliteDb) {
    // create new DB
    sqliteDb = new SQL.Database()
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS family_member (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      age INTEGER,
      color TEXT,
      grade TEXT,
      school TEXT
    );`)
    const db = drizzle(sqliteDb, { schema })
    await seedFamilyMembers(db)
    // persist
    persistDb(sqliteDb, storageKey)
  }

  const db = drizzle(sqliteDb, { schema })

  function persist() {
    persistDb(sqliteDb, storageKey)
  }

  return { db, persist }
}

function persistDb(sqliteDb: any, storageKey: string) {
  if (typeof window === "undefined") return
  const bytes = sqliteDb.export() as Uint8Array
  const base64 = uint8ToBase64(bytes)
  window.localStorage.setItem(storageKey, base64)
}