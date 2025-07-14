import { familyMember } from "./schema"

export async function seedFamilyMembers(db: any) {

  // Clear existing rows
  await db.delete(familyMember).run()

  // Insert sample data
  await db
    .insert(familyMember)
    .values([
      {
        id: "mom",
        name: "Sarah",
        role: "parent",
        age: 35,
        color: "bg-pink-500",
        grade: null,
        school: null,
      },
      {
        id: "dad",
        name: "Mike",
        role: "parent",
        age: 37,
        color: "bg-blue-500",
        grade: null,
        school: null,
      },
      {
        id: "emma",
        name: "Emma",
        role: "child",
        age: 8,
        color: "bg-purple-500",
        grade: "3rd Grade",
        school: "Riverside Elementary",
      },
      {
        id: "lucas",
        name: "Lucas",
        role: "child",
        age: 5,
        color: "bg-green-500",
        grade: "Kindergarten",
        school: "Riverside Elementary",
      },
    ])
    .run()
}

// For ad-hoc execution removed context