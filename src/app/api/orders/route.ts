import { NextResponse } from 'next/server';
import { getCurrentAccount, requireRole } from '@/lib/auth/account';
import { supabaseAdmin } from '@/lib/flows/admin-client';
import { sendOrderNotification } from '@/lib/slack/notify';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders
 * Returns list of orders for the current user's account.
 * Admins/owners see all account orders; regular members see their account orders.
 */
export async function GET() {
  try {
    const { supabase, accountId, role } = await getCurrentAccount();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet if migration hasn't run; return empty list gracefully
      console.warn('[orders GET] database query error:', error.message);
      return NextResponse.json({ orders: [], isAdmin: ['owner', 'admin'].includes(role) });
    }

    return NextResponse.json({
      orders: orders || [],
      isAdmin: ['owner', 'admin'].includes(role),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message, orders: [] }, { status: 401 });
  }
}

/**
 * POST /api/orders
 * Place a new zero-gateway order with UPI / UTR details.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email || null;
    const body = await request.json().catch(() => ({}));

    const itemName = typeof body.itemName === 'string' ? body.itemName.trim() : '';
    const amount = Number(body.amount);
    const whatsappPhone = typeof body.whatsappPhone === 'string' ? body.whatsappPhone.trim() : '';
    const utrNumber = typeof body.utrNumber === 'string' ? body.utrNumber.trim() : null;
    const parameters = typeof body.parameters === 'object' && body.parameters !== null ? body.parameters : {};
    const orderType = typeof body.orderType === 'string' ? body.orderType.trim() : 'lead_pack';

    if (!itemName || isNaN(amount) || amount <= 0 || !whatsappPhone) {
      return NextResponse.json(
        { error: 'Item name, valid amount, and WhatsApp phone are required' },
        { status: 400 }
      );
    }

    // Generate readable order number e.g. ORD-20261018-7492
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randSuffix}`;

    const newOrder = {
      account_id: accountId,
      user_id: userId || null,
      order_number: orderNumber,
      order_type: orderType,
      item_name: itemName,
      amount,
      currency: 'INR',
      payment_method: 'upi_qr',
      utr_number: utrNumber,
      whatsapp_phone: whatsappPhone,
      parameters,
      status: 'pending_verification',
    };

    const { data: inserted, error } = await supabaseAdmin()
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) {
      console.error('[orders POST] insert error:', error);
      return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
    }

    // Fire instant Slack alert to admin channel (non-blocking)
    void sendOrderNotification({
      orderNumber,
      itemName,
      amount,
      currency: 'INR',
      utrNumber,
      whatsappPhone,
      niche: parameters.niche,
      city: parameters.city,
      userEmail,
    }).catch((slackErr) => console.warn('[orders POST] slack alert error:', slackErr));

    return NextResponse.json({
      success: true,
      order: inserted,
      orderNumber,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * PATCH /api/orders
 * Admin action: verify payment, fulfill order, or reject.
 */
export async function PATCH(request: Request) {
  try {
    const { accountId } = await requireRole('admin');
    const body = await request.json().catch(() => ({}));

    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim() : null;

    if (!orderId || !['pending_verification', 'paid', 'fulfilled', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid orderId and status are required' },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabaseAdmin()
      .from('orders')
      .update({
        status,
        ...(adminNotes !== null ? { admin_notes: adminNotes } : {}),
      })
      .eq('id', orderId)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      console.error('[orders PATCH] update error:', error);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
