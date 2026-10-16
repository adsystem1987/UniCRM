import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EvolutionClient, evolution } from '@/lib/evolution/client';

/**
 * Manage WhatsApp Web instances & QR Code pairing for an account.
 * Connects to a WhatsApp Web Gateway to generate real cryptographic
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
      : evolution;

    // 1. Check if instance already exists and is connected
    try {
      const connState = await client.getConnectionState(instanceName);
      if (connState?.instance?.state === 'open') {
        return NextResponse.json({ success: true, qr: { state: 'open' } });
      }
    } catch {
      // Instance does not exist yet or connection check not ready
    }

    // 2. Try fetching active QR code
    try {
      const qrData = await client.getQrCode(instanceName);
      if (qrData?.state === 'open') {
        return NextResponse.json({ success: true, qr: { state: 'open' } });
      }
      if (qrData?.base64) {
        return NextResponse.json({ success: true, qr: qrData });
      }
    } catch {
      // Instance likely does not exist yet on gateway, proceed to create it
    }

    // 3. Create instance if not yet created
    try {
      const origin = req.nextUrl.origin;
      const webhookUrl = `${origin}/api/evolution/webhook`;
      const createRes = await client.createInstance(instanceName, webhookUrl);
      const qrData = (createRes?.qrcode?.base64)
        ? createRes.qrcode
        : await client.getQrCode(instanceName);

      if (qrData?.base64 || qrData?.state === 'open') {
        return NextResponse.json({ success: true, qr: qrData });
      }
    } catch (err: unknown) {
      // If error is "already in use" (403), re-check connection state gracefully
      try {
        const connState = await client.getConnectionState(instanceName);
        if (connState?.instance?.state === 'open') {
          return NextResponse.json({ success: true, qr: { state: 'open' } });
        }
        const qrData = await client.getQrCode(instanceName);
        if (qrData?.base64 || qrData?.state === 'open') {
          return NextResponse.json({ success: true, qr: qrData });
        }
      } catch {}

      const targetUrl = customGatewayUrl || process.env.EVOLUTION_URL || 'endpoint';
      const message = err instanceof Error ? err.message : 'Gateway unreachable';
      return NextResponse.json({
        success: false,
        gatewayOffline: true,
        message: `Unable to reach WhatsApp Gateway at ${targetUrl}: ${message}`,
      });
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
