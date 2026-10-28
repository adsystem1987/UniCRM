'use client';

import { IndustryBlueprintsPanel } from '@/components/settings/industry-blueprints-panel';
import { Compass } from 'lucide-react';

export default function BlueprintsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            1-Click Industry Setup
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnkey templates, tags, deals pipelines, and automated WhatsApp starter flows for your specific business niche.
          </p>
        </div>
      </div>

      <IndustryBlueprintsPanel />
    </div>
  );
}
