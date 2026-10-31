import { Metadata } from "next";
import { OutreachConsoleView } from "@/components/outreach/outreach-console-view";

export const metadata: Metadata = {
  title: "Outreach & Growth Engine | UniCRM",
  description: "Platform owner command center for service provider onboarding and cold outreach.",
};

export default function OutreachPage() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <OutreachConsoleView />
    </div>
  );
}
