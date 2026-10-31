/**
 * Professional Payment Receipt Template
 * Generates standalone, responsive, print-optimized HTML receipts for UniCRM orders.
 * Follows zero-tax payment receipt standards with tax invoice guidance.
 */

export interface ReceiptData {
  receiptNumber: string;
  orderNumber: string;
  itemName: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  utrNumber?: string | null;
  whatsappPhone: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  parameters?: {
    niche?: string;
    city?: string;
    leads_count?: number;
    packId?: string;
  };
}

export function generatePaymentReceiptHtml(data: ReceiptData): string {
  const currencySymbol = data.currency === "USD" ? "$" : "₹";
  const formattedAmount = `${currencySymbol}${data.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const formattedDate = new Date(data.paidAt || data.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(data.paidAt || data.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const targetInfo = data.parameters?.niche
    ? `${data.parameters.niche} (${data.parameters.city || "All India"})`
    : data.parameters?.leads_count
    ? `${data.parameters.leads_count.toLocaleString()} Verified Records`
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt - ${data.receiptNumber} (${data.orderNumber})</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 32px 16px;
    }
    .receipt-container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .receipt-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 32px 32px 28px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .badge-paid {
      display: inline-flex;
      align-items: center;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 13px;
    }
    .header-meta-label {
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .header-meta-value {
      color: #f1f5f9;
      font-weight: 600;
      margin-top: 2px;
    }
    .receipt-body {
      padding: 32px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 12px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .info-table td {
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }
    .info-value {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: -0.01em;
    }
    .item-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .item-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .item-desc {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .amount-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 14px;
      font-weight: 700;
      color: #166534;
    }
    .amount-value {
      font-size: 22px;
      font-weight: 800;
      color: #15803d;
    }
    .tax-notice {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 12px 16px;
      font-size: 12px;
      color: #92400e;
      border-radius: 0 6px 6px 0;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .tax-notice strong {
      font-weight: 700;
    }
    .receipt-footer {
      border-top: 1px solid #e2e8f0;
      padding: 20px 32px 28px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background: #fafafa;
    }
    .footer-help {
      margin-top: 6px;
      font-size: 11px;
      color: #64748b;
    }
    .actions-bar {
      max-width: 680px;
      margin: 16px auto 0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
    }
    .btn:hover {
      background: #1e293b;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-container { box-shadow: none; border: none; }
      .actions-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-header">
      <div class="header-top">
        <div>
          <div class="brand-title">UniCRM</div>
          <div class="brand-subtitle">Official Payment Receipt &bull; Zero-Gateway Direct Payment</div>
        </div>
        <div class="badge-paid">Paid &bull; Verified</div>
      </div>
      <div class="header-meta">
        <div>
          <div class="header-meta-label">Receipt Number</div>
          <div class="header-meta-value mono">${data.receiptNumber}</div>
        </div>
        <div>
          <div class="header-meta-label">Order Reference</div>
          <div class="header-meta-value mono">${data.orderNumber}</div>
        </div>
        <div>
          <div class="header-meta-label">Payment Date</div>
          <div class="header-meta-value">${formattedDate} at ${formattedTime}</div>
        </div>
        <div>
          <div class="header-meta-label">Customer Contact</div>
          <div class="header-meta-value mono">${data.whatsappPhone}</div>
        </div>
      </div>
    </div>

    <div class="receipt-body">
      <div class="section-title">Item Details</div>
      <div class="item-box">
        <div class="item-name">${data.itemName}</div>
        ${targetInfo ? `<div class="item-desc">Parameters: ${targetInfo}</div>` : ""}
      </div>

      <div class="section-title">Payment Verification</div>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="info-label">Payment Mode</td>
            <td class="info-value">Direct UPI QR / Intent</td>
          </tr>
          <tr>
            <td class="info-label">UPI Reference / UTR Number</td>
            <td class="info-value mono">${data.utrNumber || "Verified by Platform Owner"}</td>
          </tr>
          <tr>
            <td class="info-label">Payment Status</td>
            <td class="info-value" style="color: #10b981;">VERIFIED &amp; COMPLETED</td>
          </tr>
        </tbody>
      </table>

      <div class="amount-box">
        <div class="amount-label">Total Amount Paid</div>
        <div class="amount-value">${formattedAmount}</div>
      </div>

      <div class="tax-notice">
        <strong>Payment Note:</strong> This document serves as an official confirmation of payment received. As of this transaction, no Goods &amp; Services Tax (GST) has been levied. If your organization requires a formal GST Tax Invoice, please notify us at <strong>help@dfyunicrm.com</strong> or your account manager prior to making payments or within 7 days.
      </div>
    </div>

    <div class="receipt-footer">
      <div>UniCRM &bull; Done-For-You Customer Relationship Platform &bull; https://dfyunicrm.com</div>
      <div class="footer-help">Questions? Contact support at help@dfyunicrm.com or WhatsApp official support.</div>
    </div>
  </div>

  <div class="actions-bar">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;
}
