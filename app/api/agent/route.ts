// Legacy-Route. Bitte /api/kapi/chat verwenden.
// Wird beim naechsten Release entfernt.
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: { code: 'deprecated', message: 'Bitte /api/kapi/chat verwenden.' } },
    { status: 410 }
  );
}
