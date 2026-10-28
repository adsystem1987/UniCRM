'use client';

import { useAuth } from '@/hooks/use-auth';
import { BusinessPageEditor } from '@/components/business-page/business-page-editor';
import { Globe, Loader2 } from 'lucide-react';

export default function BusinessPagesDashboard() {
  const { accountId, profileLoading } = useAuth();

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <Loader2 className="size-6 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Micro-Pages & Booking
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your mobile-first link-in-bio, service catalog, and WhatsApp appointment booking desk.
          </p>
        </div>
      </div>

      <BusinessPageEditor accountId={accountId || ''} />
    </div>
  );
}
