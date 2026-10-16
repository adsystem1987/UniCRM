import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EvolutionClient, evolution } from '@/lib/evolution/client';

/**
 * Manage WhatsApp Web instances & QR Code pairing for an account.
 * Requires an active Evolution API gateway to generate real cryptographic
 * WhatsApp Web pairing handshakes.
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
    const customGatewayUrl = searchParams.get('gatewayUrl');
    const customApiKey = searchParams.get('apiKey');

    const client = customGatewayUrl
      ? new EvolutionClient(customGatewayUrl, customApiKey || 'unicrm-evolution-secret-key')
      : process.env.EVOLUTION_URL
        ? evolution
        : null;

    if (!client) {
      return NextResponse.json({
        success: false,
        gatewayOffline: true,
        message:
          'WhatsApp Web Gateway is not configured. WhatsApp requires a live gateway server to generate authentic QR handshakes.',
      });
    }

    try {
      const qrData = await client.getQrCode(instanceName);
      if (qrData?.base64 || qrData?.state === 'open') {
        return NextResponse.json({ success: true, qr: qrData });
      }
    } catch {
      try {
        const origin = req.nextUrl.origin;
        const webhookUrl = `${origin}/api/evolution/webhook`;
        await client.createInstance(instanceName, webhookUrl);
        const qrData = await client.getQrCode(instanceName);
        if (qrData?.base64 || qrData?.state === 'open') {
          return NextResponse.json({ success: true, qr: qrData });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gateway unreachable';
        return NextResponse.json({
          success: false,
          gatewayOffline: true,
          message: `Unable to reach WhatsApp Gateway at ${customGatewayUrl || process.env.EVOLUTION_URL}: ${message}`,
        });
      }
    }

    return NextResponse.json({
      success: false,
      gatewayOffline: true,
      message: 'Gateway did not return an active QR code session.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query gateway';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'connect';
    const instanceName = body.instance || `acc_${user.id.slice(0, 8)}`;
    const customGatewayUrl = body.gatewayUrl;
    const customApiKey = body.apiKey;

    const client = customGatewayUrl
      ? new EvolutionClient(customGatewayUrl, customApiKey || 'unicrm-evolution-secret-key')
      : process.env.EVOLUTION_URL
        ? evolution
        : null;

    if (action === 'disconnect') {
      if (client) {
        await client.logout(instanceName).catch(() => {});
      }
      return NextResponse.json({ success: true, state: 'close' });
    }

    return NextResponse.json({ success: true, state: 'open' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
