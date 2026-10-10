import { NextResponse } from 'next/server';
import { getLastEntry } from '@/lib/store';

export async function GET() {
  try {
    const entry = getLastEntry();

    if (!entry) {
      return NextResponse.json(
        { message: 'No intent processed yet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        intent: entry.intent,
        layout: entry.layout,
        timestamp: entry.timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API/DEBUG/LAST-INTENT] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
