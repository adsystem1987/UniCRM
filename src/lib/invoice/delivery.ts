import { supabaseAdmin } from "@/lib/flows/admin-client";
import {
  getOrRefreshDriveToken,
  getOrCreateDriveFolder,
  uploadBufferToDrive,
} from "@/lib/gdrive/client";
import { generatePaymentReceiptHtml, ReceiptData } from "@/lib/invoice/receipt-template";

export interface DeliveryResult {
  success: boolean;
  receiptNumber?: string;
  driveFileId?: string;
  driveUrl?: string;
  error?: string;
}

/**
 * Deliver Payment Receipt to Google Drive
 * Generates an official payment receipt and uploads it to Google Drive into
 * the "DFY UniCRM Attachments / Receipts" subfolder.
 *
 * Saves receipt_number, receipt_gdrive_file_id, receipt_gdrive_url to the order.
 */
export async function deliverReceiptToGoogleDrive(orderId: string): Promise<DeliveryResult> {
  const admin = supabaseAdmin();

  // 1. Fetch order details
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    console.error("[receipt-delivery] Order not found:", orderId, orderErr?.message);
    return { success: false, error: "Order not found" };
  }

  // 2. Generate or ensure receipt number
  let receiptNumber = order.receipt_number;
  if (!receiptNumber) {
    const monthPrefix = `REC-${new Date().toISOString().slice(0, 7).replace("-", "")}-`;
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .like("receipt_number", `${monthPrefix}%`);
    const seq = ((count || 0) + 1).toString().padStart(4, "0");
    receiptNumber = `${monthPrefix}${seq}`;
  }

  // 3. Find Google Drive configuration
  // First check the order's account
  let { data: driveConfig } = await admin
    .from("gdrive_configs")
    .select("*")
    .eq("account_id", order.account_id)
    .maybeSingle();

  // If not found, check if any platform admin account has a connected Drive
  if (!driveConfig) {
    const { data: anyConfig } = await admin
      .from("gdrive_configs")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    driveConfig = anyConfig || null;
  }

  // 4. Generate the HTML receipt buffer
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

  const htmlContent = generatePaymentReceiptHtml(receiptData);
  const buffer = Buffer.from(htmlContent, "utf-8");

  // If no Google Drive is connected anywhere, save receipt number & timestamp only
  if (!driveConfig || !driveConfig.refresh_token) {
    console.log("[receipt-delivery] No Google Drive connected. Recording receipt number only.");
    await admin
      .from("orders")
      .update({
        receipt_number: receiptNumber,
        receipt_generated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return {
      success: true,
      receiptNumber,
      error: "Google Drive is not connected. Connect in Settings > Integrations > Google Drive to auto-sync files.",
    };
  }

  try {
    // 5. Obtain valid access token
    const accessToken = await getOrRefreshDriveToken(
      driveConfig.account_id,
      driveConfig.refresh_token
    );

    // 6. Ensure root folder and "Receipts" subfolder
    const rootFolderName = driveConfig.target_folder || "DFY UniCRM Attachments";
    const rootFolderId = await getOrCreateDriveFolder(accessToken, rootFolderName);
    const receiptsFolderId = await getOrCreateDriveFolder(accessToken, "Receipts", rootFolderId);

    // 7. Upload receipt HTML to Google Drive
    const filename = `Receipt-${receiptNumber}-${order.order_number}.html`;
    const uploadResult = await uploadBufferToDrive({
      accessToken,
      folderId: receiptsFolderId,
      filename,
      mimeType: "text/html",
      buffer,
    });

    // 8. Update order in database with Google Drive file details
    await admin
      .from("orders")
      .update({
        receipt_number: receiptNumber,
        receipt_gdrive_file_id: uploadResult.fileId,
        receipt_gdrive_url: uploadResult.webViewLink,
        receipt_generated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    console.log(`[receipt-delivery] Receipt uploaded to Drive: ${uploadResult.webViewLink}`);

    return {
      success: true,
      receiptNumber,
      driveFileId: uploadResult.fileId,
      driveUrl: uploadResult.webViewLink,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Google Drive upload failed";
    console.error("[receipt-delivery] Error uploading receipt to Drive:", errorMsg);

    // Still persist the receipt number so user has the reference
    await admin
      .from("orders")
      .update({
        receipt_number: receiptNumber,
        receipt_generated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return {
      success: false,
      receiptNumber,
      error: errorMsg,
    };
  }
}
