'use client';

import { OrdersBillingPanel } from '@/components/settings/orders-billing-panel';
import { Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function OrdersPage() {
  const { profile } = useAuth();
  const isCustomer = profile?.user_type === 'customer' || profile?.role === 'customer';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Receipt className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isCustomer ? "My Orders & Receipts" : "Orders & Billing"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCustomer
              ? "Track your purchases, payment verification status, and view or download receipts."
              : "Track customer orders, manual UPI/card verifications, transaction records, and automated Google Drive payment receipts."}
          </p>
        </div>
      </div>

      <OrdersBillingPanel isCustomer={isCustomer} />
    </div>
  );
}
