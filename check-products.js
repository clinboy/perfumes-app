const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, imageUrl: true } });
  
  const images = [
    'Bharara King Gold.jpg',
    'JPG Le Male.jpg', 
    'JPG Le Male Elixir.jpg',
    '9PM Elixir.jpg',
  ];
  
  console.log('=== Products with matching images ===');
  for (const img of images) {
    const match = products.find(p => p.imageUrl && p.imageUrl.includes(encodeURIComponent(img)));
    if (match) {
      console.log(`FOUND: ${match.name} (id: ${match.id}) -> ${match.imageUrl}`);
    } else {
      console.log(`NOT FOUND: ${img}`);
    }
  }
  
  console.log('\n=== All products ===');
  products.forEach(p => console.log(`${p.id}: ${p.name} -> ${p.imageUrl || 'NO IMAGE'}`));
  console.log('Total:', products.length);
}

main().finally(() => prisma.$disconnect());
