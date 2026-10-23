import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/account';
import { STARTER_TEMPLATES } from '@/lib/whatsapp/starter-templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('admin');
    return NextResponse.json({ templates: STARTER_TEMPLATES });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
