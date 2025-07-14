import { getDb } from "../../../database/client"
import { familyMember } from "../../../database/schema"

export async function fetchFamilyMembers() {
  const db = await getDb()
  const rows = await db.select().from(familyMember).all()
  return rows
}