import { NextResponse } from 'next/server';
import { getCurrentAccount, requireRole } from '@/lib/auth/account';
import { testChatwootConnection, getChatwootConfig } from '@/lib/integrations/chatwoot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const config = await getChatwootConfig(supabase, accountId);

    return NextResponse.json({
      connected: Boolean(config?.enabled),
      baseUrl: config?.baseUrl || '',
      accountId: config?.accountId || '',
      inboxId: config?.inboxId || '',
      syncInbound: config?.syncInbound ?? true,
      syncOutbound: config?.syncOutbound ?? true,
    });
  } catch (err) {
    return NextResponse.json({ connected: false });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, accountId } = await requireRole('admin');
    const body = await request.json().catch(() => ({}));

    const baseUrl = typeof body.baseUrl === 'string' ? body.baseUrl.trim() : '';
    const chatwootAccountId = typeof body.accountId === 'string' ? body.accountId.trim() : '';
    const inboxId = typeof body.inboxId === 'string' ? body.inboxId.trim() : '';
    const apiAccessToken = typeof body.apiAccessToken === 'string' ? body.apiAccessToken.trim() : '';

    if (!baseUrl || !chatwootAccountId || !inboxId || !apiAccessToken) {
      return NextResponse.json(
        { error: 'All fields (Base URL, Account ID, Inbox ID, API Token) are required.' },
        { status: 400 }
      );
    }

    // Test connection before saving
    const test = await testChatwootConnection({
      baseUrl,
      accountId: chatwootAccountId,
      inboxId,
      apiAccessToken,
    });

    if (!test.ok) {
      return NextResponse.json(
        { error: `Chatwoot connection failed: ${test.message}` },
        { status: 400 }
      );
    }

    // Upsert into chatwoot_configs table
    const { error: dbError } = await supabase.from('chatwoot_configs').upsert(
      {
        account_id: accountId,
        base_url: baseUrl,
        chatwoot_account_id: chatwootAccountId,
        chatwoot_inbox_id: inboxId,
        api_token: apiAccessToken,
        is_active: true,
        sync_inbound: true,
        sync_outbound: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id' }
    );

    if (dbError) {
      console.warn('[chatwoot/status POST] db upsert fallback:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Chatwoot connected successfully!',
      inboxName: test.inboxName,
    });
  } catch (err) {
    console.error('[chatwoot/status POST] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save Chatwoot settings' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { supabase, accountId } = await requireRole('admin');
    await supabase.from('chatwoot_configs').delete().eq('account_id', accountId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to disconnect Chatwoot' },
      { status: 500 }
    );
  }
}
