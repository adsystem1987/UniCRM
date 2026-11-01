import { Suspense } from "react";
import type { Metadata } from "next";
import { LoansClientView } from "./loans-client-view";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply Loans & Capital Desk | UniCRM",
  description: "AI-assisted business, home, and MSME loan pre-screening with 1-click WhatsApp document verification.",
};

export default function LoansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoansClientView />
    </Suspense>
  );
}
