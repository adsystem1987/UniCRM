'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { OrdersBillingPanel } from '@/components/settings/orders-billing-panel';
import { Receipt } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { profile } = useAuth();

  // If a retail customer accesses /orders directly, redirect them to their loan advisory desk
  useEffect(() => {
    if (profile?.user_type === 'customer' || profile?.role === 'customer') {
      router.replace('/loans');
    }
  }, [profile, router]);
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
