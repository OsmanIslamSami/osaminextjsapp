import { NextResponse } from 'next/server';
import { ensureUserSynced } from '@/lib/auth/sync';
import { logger } from '@/lib/utils/logger';

export async function POST() {
  try {
    const user = await ensureUserSynced();
    return NextResponse.json(user);
  } catch (error) {
    logger.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
