import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://perfumes-db-lacho21.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUwODQ0NTksImlkIjoiMDE5ZjMzYWMtOTAwMS03NDk3LThmNTgtOTExYTUxZmJkNTEzIiwia2lkIjoiQUJ0X0t1Z2szLVA0MEhwaW9OeXpPdk5rNkZUZ0ZtVnpTMWtfTEI0ajk1WSIsInJpZCI6IjZjNjBlNjViLWI1NmMtNDI1Yy1iNmZhLWY4NGY2YmFiYTExMCJ9.AD-4rCtiqhHxzEzlqKOG1u8yqFVZ6zl9igCYW2XSNu1qQCpFoKJeyd1BBs9JMCb2NhavoVTjVjV5ksk_-YPBDg",
});

async function main() {
  const result = await client.execute("SELECT id, name, imageUrl FROM Product ORDER BY name");
  
  const targetImages = ['Bharara King Gold.jpg', 'JPG Le Male.jpg', 'JPG Le Male Elixir.jpg', '9PM Elixir.jpg'];
  
  console.log('=== Target image check ===');
  for (const img of targetImages) {
    const row = result.rows.find(r => String(r.imageUrl).includes(img));
    if (row) {
      console.log(`FOUND: id=${row.id} "${row.name}" -> ${row.imageUrl}`);
    } else {
      console.log(`NOT FOUND in DB: ${img}`);
    }
  }
  
  console.log('\n=== All products ===');
  for (const row of result.rows) {
    console.log(`${row.id}: ${row.name} -> ${row.imageUrl || 'NO IMAGE'}`);
  }
  console.log('Total:', result.rows.length);
}

main().catch(console.error);
