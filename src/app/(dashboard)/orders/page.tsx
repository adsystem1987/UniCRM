'use client';

import { OrdersBillingPanel } from '@/components/settings/orders-billing-panel';
import { Receipt } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Receipt className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orders & Billing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track customer orders, manual UPI/card verifications, transaction records, and automated Google Drive payment receipts.
          </p>
        </div>
      </div>

      <OrdersBillingPanel />
    </div>
  );
}
