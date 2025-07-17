import { prisma } from './src/lib/prisma.ts';

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany({
      take: 1
    });
    console.log('✅ Connection successful!');
    console.log('Users found:', users);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
