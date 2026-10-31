import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";
import { deliverReceiptToGoogleDrive } from "@/lib/invoice/delivery";
import { generatePaymentReceiptHtml, ReceiptData } from "@/lib/invoice/receipt-template";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]/receipt
 * View printable standalone HTML payment receipt.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { supabase, accountId } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;
    const isMasterAdmin = isMasterAdminEmail(callerEmail);

    let query = isMasterAdmin
      ? supabaseAdmin().from("orders").select("*").eq("id", orderId)
      : supabase.from("orders").select("*").eq("id", orderId).eq("account_id", accountId);

    const { data: order, error } = await query.single();

    if (error || !order) {
      return new NextResponse("Receipt not found or unauthorized", { status: 404 });
    }

    const receiptNumber = order.receipt_number || `REC-${order.order_number}`;

    const receiptData: ReceiptData = {
      receiptNumber,
      orderNumber: order.order_number,
      itemName: order.item_name,
      amount: Number(order.amount),
      currency: order.currency || "INR",
      paymentMethod: order.payment_method || "Direct UPI",
      utrNumber: order.utr_number,
      whatsappPhone: order.whatsapp_phone,
      status: order.status,
      createdAt: order.created_at,
      paidAt: order.updated_at,
      parameters: order.parameters || {},
    };

    const html = generatePaymentReceiptHtml(receiptData);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return new NextResponse(message, { status: 401 });
  }
}

/**
 * POST /api/orders/[id]/receipt
 * Syncs / delivers payment receipt to Google Drive.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { supabase, accountId, role } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const callerEmail = userData?.user?.email || null;
    const isMasterAdmin = isMasterAdminEmail(callerEmail);

    // Verify order access
    let query = isMasterAdmin
      ? supabaseAdmin().from("orders").select("id, account_id, status").eq("id", orderId)
      : supabase.from("orders").select("id, account_id, status").eq("id", orderId).eq("account_id", accountId);

    const { data: order, error } = await query.single();
    if (error || !order) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
    }

    const result = await deliverReceiptToGoogleDrive(orderId);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
