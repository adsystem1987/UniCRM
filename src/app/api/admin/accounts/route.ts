import { NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth/account';
import { supabaseAdmin } from '@/lib/flows/admin-client';
import { isMasterAdminEmail } from '@/lib/auth/master-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/accounts
 * Master admin endpoint: Lists all accounts on the platform with user counts and status.
 */
export async function GET() {
  try {
    const { supabase } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;

    if (!isMasterAdminEmail(callerEmail)) {
      return NextResponse.json({ error: 'Platform Owner privileges required' }, { status: 403 });
    }

    const admin = supabaseAdmin();

    // Fetch accounts
    const { data: accounts, error: accError } = await admin
      .from('accounts')
      .select('id, name, owner_user_id, status, suspension_reason, suspended_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (accError) {
      console.error('[Admin/Accounts GET] error:', accError);
      return NextResponse.json({ error: accError.message }, { status: 500 });
    }

    // Fetch members to display count and owner emails
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name, account_id, role');

    // Fetch entitlements to surface active status badges directly on the platform list
    const { data: entitlements } = await admin
      .from('account_entitlements')
      .select('account_id, ai_pro_active, ai_pro_expires_at, lead_credits_balance, ai_api_key_encrypted, lead_scraper_token_encrypted');

    const accountsWithMeta = (accounts || []).map((acc) => {
      const accMembers = (profiles || []).filter((p) => p.account_id === acc.id);
      const owner = accMembers.find((m) => m.id === acc.owner_user_id) || accMembers[0];
      const ent = (entitlements || []).find((e) => e.account_id === acc.id);

      const isAiProActive = Boolean(
        ent?.ai_pro_active &&
          (!ent.ai_pro_expires_at || new Date(ent.ai_pro_expires_at) > new Date())
      );

      return {
        ...acc,
        status: acc.status || 'active',
        member_count: accMembers.length,
        owner_email: owner?.email || 'Unknown',
        owner_name: owner?.full_name || 'Anonymous',
        entitlements: {
          aiProActive: isAiProActive,
          aiProExpiresAt: ent?.ai_pro_expires_at || null,
          hasCustomAiKey: Boolean(ent?.ai_api_key_encrypted),
          leadCredits: ent?.lead_credits_balance || 0,
          hasCustomScraperToken: Boolean(ent?.lead_scraper_token_encrypted),
        },
      };
    });

    return NextResponse.json({
      accounts: accountsWithMeta,
      isMasterAdmin: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * PATCH /api/admin/accounts
 * Master admin endpoint: Update account status (active, suspended, phased_out).
 */
export async function PATCH(request: Request) {
  try {
    const { supabase } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;

    if (!isMasterAdminEmail(callerEmail)) {
      return NextResponse.json({ error: 'Platform Owner privileges required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const accountId = typeof body.accountId === 'string' ? body.accountId.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    const suspensionReason = typeof body.suspensionReason === 'string' ? body.suspensionReason.trim() : null;

    if (!accountId || !['active', 'suspended', 'phased_out'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid accountId and status (active, suspended, phased_out) are required' },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'suspended') {
      updatePayload.suspended_at = new Date().toISOString();
      updatePayload.suspension_reason = suspensionReason || 'Administrative suspension';
    } else if (status === 'active') {
      updatePayload.suspended_at = null;
      updatePayload.suspension_reason = null;
    }

    const { data: updated, error } = await admin
      .from('accounts')
      .update(updatePayload)
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      console.error('[Admin/Accounts PATCH] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
