# On-Device SQLite Integration – Engineering Notes

_Last updated: <!-- TIMESTAMP_PLACEHOLDER -->_

## 1. Codebase Snapshot

• Front-end: Next.js 14 (App Router), React 18, TypeScript.
• Styling: TailwindCSS, Lucide icons.
• Domain: “Family Calendar” demo – calendar, meals, chores, insights.
• Architecture: Model → Controller → Presenter pattern under `lib/family/`, rendered by components in `app/` and `components/`.
• Data layer today: **pure in-memory arrays** (see `lib/family/model.ts`). No persistence, no network/API calls, no database libraries imported.

## 2. Current SQLite Footprint

A repo-wide search for the following keywords returned **zero matches**:
`sqlite`, `sqlite3`, `sql.js`, `prisma`, `drizzle`, `typeorm`, `knex`.

Conclusion: _SQLite is **not** yet integrated._ All data is ephemeral and resets on reload.

## 3. Why SQLite Per Device?

1. Offline-first user experience (mobile / desktop / PWA).
2. Simple, zero-config, single-file database fits family-app scale.
3. Well-supported wrappers across platforms (sql.js / WASM for web, Expo SQLite for React Native, better-sqlite3 or Prisma for Electron).

## 4. Integration Strategy (High-Level)

1. **Choose runtime binding**
   • Web-only → `sql.js` (SQLite compiled to WebAssembly).
   • Hybrid/Electron → `better-sqlite3` (Node native) or `drizzle-kit + sqlite`.
2. **Define schema** mapping current TypeScript types (`FamilyMember`, `FamilyEvent`, etc.) to tables.
3. **Generate migrations** (drizzle, Kysely, Prisma Migrate, or hand-rolled SQL files).
4. **Implement data-access layer**
   • Replace array lookups in `lib/family/model.ts` with async DAO functions (keeping current signatures for minimal surface change).
   • Leverage repository pattern for testability.
5. **Sync / backup (optional)**
   • End-to-end encrypted push to cloud when online.
   • Conflict resolution using timestamps + per-device merge.

## 5. Proposed Directory Layout
```
/database
  ├─ migrations/
  ├─ schema.sql
  ├─ seed.ts
  └─ client.ts         ← SQLite open/connection pooling
/lib
  └─ data/
        ├─ dao/
        │    ├─ familyMember.dao.ts
        │    └─ familyEvent.dao.ts
        └─ repository.ts
```

## 6. Minimal Proof-of-Concept Steps

1. Add deps: `pnpm add sql.js drizzle-orm drizzle-orm/sqlite`.  
2. Create `/database/client.ts` that loads SQL.js, opens `family.db` inside `IndexedDBStorage` (sql.js offers this by default).  
3. Port `getFamilyMembers()` to fetch from `SELECT * FROM family_member;`.  
4. Render same `app/page.tsx` – UI should remain identical but backed by SQLite.

## 7. Open Questions / Parking Lot

• How large can expected DB grow (photos, binary)?  
• Encryption at rest requirement? (sqlcipher build vs. custom AES layer)  
• Multi-device sync frequency & conflict policy.

---

Feel free to append new observations below this line; maintain reverse-chronological order.

---

### 2025-07-14 – Initial Audit
• No DB present. Planning outlined above.