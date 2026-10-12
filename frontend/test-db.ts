import { db } from './src/lib/db';

async function test() {
  try {
    console.log('Testing DB connection...');
    const result = await db.user.findFirst();
    console.log('Connection successful!', result);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

test();
