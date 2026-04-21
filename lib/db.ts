import { Pool } from 'pg';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { logger } from '@/lib/utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: (string | number | boolean | Date | null | undefined)[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

// Prisma Client with Neon adapter
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

export default pool;
