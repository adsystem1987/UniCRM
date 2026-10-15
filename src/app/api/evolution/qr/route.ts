import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evolution } from '@/lib/evolution/client';

/**
 * Manage Evolution API WhatsApp instances & QR Code pairing for an account
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instanceName = searchParams.get('instance') || `acc_${user.id.slice(0, 8)}`;

    // Try fetching QR code / connection status
    try {
      const qrData = await evolution.getQrCode(instanceName);
      return NextResponse.json({ success: true, qr: qrData });
    } catch {
      // If instance doesn't exist, create it
      const origin = req.nextUrl.origin;
      const webhookUrl = `${origin}/api/evolution/webhook`;
      await evolution.createInstance(instanceName, webhookUrl);
      const qrData = await evolution.getQrCode(instanceName);
      return NextResponse.json({ success: true, qr: qrData });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch QR code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
