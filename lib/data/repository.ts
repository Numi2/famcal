import { fetchFamilyMembers } from "./dao/familyMember.dao"
import type { FamilyMember } from "../family/types"

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const rows = await fetchFamilyMembers()
  // drizzle returns raw rows; cast to FamilyMember here (PoC – no validation yet)
  return rows as unknown as FamilyMember[]
}