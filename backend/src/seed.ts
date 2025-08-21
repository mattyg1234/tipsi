import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Jumping Jacks',
      brandColor: '#dc2626',
      logoUrl: null
    }
  });

  console.log(`✅ Created venue: ${venue.name}`);

  // Create tables 1-40
  const tables = [];
  for (let i = 1; i <= 40; i++) {
    tables.push({
      venueId: venue.id,
      number: i,
      nfcUid: `demo-nfc-${i}`
    });
  }
  
  await prisma.table.createMany({ data: tables });
  console.log(`✅ Created ${tables.length} tables`);

  // Create demo users
      const users = [
      {
        role: 'VENUE_ADMIN' as const,
        name: 'Jack Owner',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_VENUE_CHAT_ID || 'demo_venue_chat'
      },
      {
        role: 'DJ' as const,
        name: 'DJ MixMaster',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_DJ_CHAT_ID || 'demo_dj_chat',
        connectId: 'acct_demo_dj'
      },
      {
        role: 'STAFF' as const,
        name: 'Shot Girl Sarah',
        venueId: venue.id,
        tgChatId: process.env.TELEGRAM_STAFF_CHAT_ID || 'demo_staff_chat'
      }
    ];

  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    console.log(`✅ Created user: ${user.name} (${user.role})`);
  }

  // Create demo menu items
  const menuItems = [
    { category: 'Bottles', name: 'Vodka Red Bull', priceCents: 2500 },
    { category: 'Bottles', name: 'Gin & Tonic', priceCents: 2200 },
    { category: 'Bottles', name: 'Whiskey Cola', priceCents: 2300 },
    { category: 'Bottles', name: 'Champagne', priceCents: 4500 },
    { category: 'Bottles', name: 'Tequila Sunrise', priceCents: 2000 },
    { category: 'Bottles', name: 'Mojito', priceCents: 1800 }
  ];

  for (const itemData of menuItems) {
    const item = await prisma.menuItem.create({
      data: {
        ...itemData,
        venueId: venue.id
      }
    });
    console.log(`✅ Created menu item: ${item.name} - €${(item.priceCents / 100).toFixed(2)}`);
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log(`\n📱 Test table page: http://localhost:3000/t/[table-id]`);
  console.log(`⚙️  Admin page: http://localhost:3000/admin/venue`);
  console.log(`🎵 DJ Badge: http://localhost:3000/dj-badge`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
