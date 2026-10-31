import { NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth/account';
import { supabaseAdmin } from '@/lib/flows/admin-client';
import { isMasterAdminEmail } from '@/lib/auth/master-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/entitlements?accountId=...
 * Retrieves provisioning details for an account (accessible only by Master Admin).
 */
export async function GET(request: Request) {
  try {
    const { supabase } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;

    if (!isMasterAdminEmail(callerEmail)) {
      return NextResponse.json({ error: 'Platform Owner privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('account_entitlements')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entitlement: data || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * POST /api/admin/entitlements
 * Provision or update AI Pro status and Lead Finder credits for a client.
 */
export async function POST(request: Request) {
  try {
    const { supabase } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;

    if (!isMasterAdminEmail(callerEmail)) {
      return NextResponse.json({ error: 'Platform Owner privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      accountId,
      aiProActive,
      aiMonthsToAdd,
      aiApiKey,
      aiProvider,
      leadCreditsToAdd,
      leadScraperToken,
      notes,
    } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // 1. Fetch current entitlements or initialize
    const { data: current } = await admin
      .from('account_entitlements')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    // Calculate AI Pro expiry
    let newExpiresAt = current?.ai_pro_expires_at ? new Date(current.ai_pro_expires_at) : new Date();
    if (newExpiresAt < new Date()) {
      newExpiresAt = new Date();
    }

    if (typeof aiMonthsToAdd === 'number' && aiMonthsToAdd > 0) {
      newExpiresAt.setMonth(newExpiresAt.getMonth() + aiMonthsToAdd);
    }

    const currentBalance = current?.lead_credits_balance || 0;
    const creditsDelta = typeof leadCreditsToAdd === 'number' ? leadCreditsToAdd : 0;
    const newBalance = Math.max(0, currentBalance + creditsDelta);
    const totalGranted = (current?.lead_credits_total_granted || 0) + (creditsDelta > 0 ? creditsDelta : 0);

    const payload: Record<string, unknown> = {
      account_id: accountId,
      ai_pro_active: aiProActive ?? current?.ai_pro_active ?? false,
      ai_pro_expires_at: aiMonthsToAdd ? newExpiresAt.toISOString() : current?.ai_pro_expires_at,
      lead_credits_balance: newBalance,
      lead_credits_total_granted: totalGranted,
      updated_at: new Date().toISOString(),
    };

    if (aiApiKey) payload.ai_api_key_encrypted = aiApiKey.trim();
    if (aiProvider) payload.ai_provider = aiProvider.trim();
    if (leadScraperToken) payload.lead_scraper_token_encrypted = leadScraperToken.trim();
    if (notes !== undefined) payload.notes = notes;

    const { data: updated, error } = await admin
      .from('account_entitlements')
      .upsert(payload, { onConflict: 'account_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, entitlement: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
