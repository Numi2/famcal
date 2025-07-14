import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const familyMember = sqliteTable("family_member", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  age: integer("age"),
  color: text("color"),
  grade: text("grade"),
  school: text("school"),
})