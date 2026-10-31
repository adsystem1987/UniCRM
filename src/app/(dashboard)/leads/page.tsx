import { Suspense } from "react";
import { LeadFinderView } from "@/components/leads/lead-finder-view";

export const metadata = {
  title: "UniCRM Smart Lead Finder | UniCRM",
  description:
    "Discover verified high-converting customer leads tailored to your target audience and Ideal Customer Profile (ICP).",
};

export default function LeadsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <Suspense fallback={null}>
        <LeadFinderView />
      </Suspense>
    </div>
  );
}
