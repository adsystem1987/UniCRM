import type { Metadata } from "next";
import { LoansClientView } from "./loans-client-view";

export const metadata: Metadata = {
  title: "Apply Loans & Capital Desk | UniCRM",
  description: "AI-assisted business, home, and MSME loan pre-screening with 1-click WhatsApp document verification.",
};

export default function LoansPage() {
  return <LoansClientView />;
}
