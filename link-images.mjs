import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://perfumes-db-lacho21.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUwODQ0NTksImlkIjoiMDE5ZjMzYWMtOTAwMS03NDk3LThmNTgtOTExYTUxZmJkNTEzIiwia2lkIjoiQUJ0X0t1Z2szLVA0MEhwaW9OeXpPdk5rNkZUZ0ZtVnpTMWtfTEI0ajk1WSIsInJpZCI6IjZjNjBlNjViLWI1NmMtNDI1Yy1iNmZhLWY4NGY2YmFiYTExMCJ9.AD-4rCtiqhHxzEzlqKOG1u8yqFVZ6zl9igCYW2XSNu1qQCpFoKJeyd1BBs9JMCb2NhavoVTjVjV5ksk_-YPBDg",
});

async function main() {
  const updates = [
    { id: 188, name: "9PM Elixir", imageUrl: "/images/9PM Elixir.jpg" },
    { id: 204, name: "Bharara King Gold", imageUrl: "/images/Bharara King Gold.jpg" },
    { id: 183, name: "JPG Le Male", imageUrl: "/images/JPG Le Male.jpg" },
  ];

  for (const u of updates) {
    await client.execute({
      sql: "UPDATE Product SET imageUrl = ? WHERE id = ?",
      args: [u.imageUrl, u.id],
    });
    console.log(`Updated: ${u.name} (id ${u.id}) -> ${u.imageUrl}`);
  }

  console.log("\nDone! All 3 images linked.");
}

main().catch(console.error);
