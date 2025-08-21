import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  console.log('📦 Creating Prisma client...');
  prisma = new PrismaClient();
  console.log('✅ Prisma client created successfully');
} catch (error) {
  console.error('❌ Failed to create Prisma client:', error);
  process.exit(1);
}

async function main() {
  try {
    console.log('🚀 Initializing TIPSI database...');
    console.log('📊 Environment check:');
    console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('  - Current directory:', process.cwd());
    console.log('  - Node version:', process.version);
    console.log('  - Platform:', process.platform);
    console.log('  - Architecture:', process.arch);
    console.log('  - Node modules path:', require.resolve('@prisma/client'));
    console.log('  - Prisma client exists:', require('fs').existsSync(require.resolve('@prisma/client')));
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
    
    // Test connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Push schema (creates tables from scratch)
    console.log('🏗️  Creating database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema created successfully');
    
    // Seed the database
    console.log('🌱 Seeding database with sample data...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
    
    console.log('🎉 TIPSI database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
