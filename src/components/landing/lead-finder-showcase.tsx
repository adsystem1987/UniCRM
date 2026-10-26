"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  CheckCircle2,
  Phone,
  MapPin,
  Star,
  ArrowRight,
  MessageCircle,
  Building,
  Home,
  Landmark,
  Stethoscope,
  Wrench,
  Gem,
  Send,
  Eye,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SampleLead {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  phonePreview: string;
  rating: number;
  reviews: number;
  tag: string;
  sampleScript: string;
}

const INDUSTRY_SHOWCASE: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tagline: string;
    leads: SampleLead[];
  }
> = {
  interior: {
    label: "Interior & Architecture",
    icon: Home,
    tagline: "High-ticket homeowners looking for modular kitchens, 3D renderings & luxury renovations.",
    leads: [
      {
        id: "int-1",
        name: "Vikram Malhotra",
        category: "3BHK Villa Renovation",
        city: "Bangalore",
        country: "India",
        phonePreview: "+91 98450 •••••",
        rating: 4.9,
        reviews: 38,
        tag: "Turnkey Fitout",
        sampleScript:
          "Hi Vikram, saw you were exploring modular kitchen & interior layouts in Whitefield. Would you like a quick PDF brochure of our recent 3D project walkthroughs?",
      },
      {
        id: "int-2",
        name: "Rashid Al Mansoori",
        category: "Luxury Villa Fitout",
        city: "Dubai",
        country: "UAE",
        phonePreview: "+971 50 •••••••",
        rating: 5.0,
        reviews: 24,
        tag: "Luxury Villa",
        sampleScript:
          "Dear Rashid, greetings from our design studio. We specialize in luxury residential fitouts across Dubai. Would you like a complimentary site assessment this week?",
      },
      {
        id: "int-3",
        name: "Elena Richardson",
        category: "Modern Kitchen Remodel",
        city: "London",
        country: "UK",
        phonePreview: "+44 7700 ••••••",
        rating: 4.8,
        reviews: 19,
        tag: "Residential Remodel",
        sampleScript:
          "Hi Elena, thanks for inquiring about our kitchen remodeling portfolio. When would be a convenient time for a brief 10-minute design discovery call?",
      },
    ],
  },
  loans: {
    label: "Loans & Mortgages",
    icon: Landmark,
    tagline: "Pre-qualified salaried and business applicants seeking fast bank sanctions and low rates.",
    leads: [
      {
        id: "ln-1",
        name: "Arjun Venkataraman",
        category: "Home Loan / ₹75 Lakhs",
        city: "Mumbai",
        country: "India",
        phonePreview: "+91 98201 •••••",
        rating: 4.9,
        reviews: 42,
        tag: "High CIBIL (780+)",
        sampleScript:
          "Hi Arjun, we compare instant home loan rate quotes across HDFC, SBI and ICICI with zero processing fees. Would you like a quick EMI calculation for your property in Mumbai?",
      },
      {
        id: "ln-2",
        name: "David Miller",
        category: "Conventional Mortgage",
        city: "Austin, TX",
        country: "USA",
        phonePreview: "+1 (512) •••-••••",
        rating: 5.0,
        reviews: 31,
        tag: "W2 Pre-Approval",
        sampleScript:
          "Hi David, mortgage rates recently dropped. Would you like a free rate quote and same-day pre-approval check for your upcoming home purchase?",
      },
      {
        id: "ln-3",
        name: "Suresh Pillai",
        category: "Commercial Business Loan",
        city: "Chennai",
        country: "India",
        phonePreview: "+91 94441 •••••",
        rating: 4.8,
        reviews: 27,
        tag: "Self-Employed",
        sampleScript:
          "Hello Suresh, we help established businesses secure working capital loans up to ₹1 Crore in 48 hours without collateral. Can we share the eligibility checklist?",
      },
    ],
  },
  realestate: {
    label: "Real Estate",
    icon: Building,
    tagline: "Verified property buyers and NRI investors seeking project brochures and site visits.",
    leads: [
      {
        id: "re-1",
        name: "Pooja Singhania",
        category: "3BHK Luxury High-Rise",
        city: "Gurugram / NCR",
        country: "India",
        phonePreview: "+91 99102 •••••",
        rating: 4.9,
        reviews: 54,
        tag: "Ready-To-Move",
        sampleScript:
          "Hello Pooja, thank you for inquiring about our luxury golf course residences in Gurugram. Attached is the project master layout and payment plan PDF. Would this weekend suit for a site tour?",
      },
      {
        id: "re-2",
        name: "Tariq Al-Hashemi",
        category: "Downtown Off-Plan Investment",
        city: "Dubai",
        country: "UAE",
        phonePreview: "+971 52 •••••••",
        rating: 5.0,
        reviews: 46,
        tag: "High Yield (>8%)",
        sampleScript:
          "Dear Tariq, we have exclusive off-plan waterfront units in Dubai with 5-year post-handover payment plans. Would you like the official investor deck?",
      },
      {
        id: "re-3",
        name: "Sarah Jenkins",
        category: "Suburban Family Home",
        city: "Toronto",
        country: "Canada",
        phonePreview: "+1 (416) •••-••••",
        rating: 4.8,
        reviews: 23,
        tag: "First-Time Buyer",
        sampleScript:
          "Hi Sarah, 3 new listings matching your school district criteria just hit the market. Would you like to schedule private walkthroughs this Saturday?",
      },
    ],
  },
  clinics: {
    label: "Clinics & Healthcare",
    icon: Stethoscope,
    tagline: "Patients seeking private consultations, cosmetic dental treatments, and wellness care.",
    leads: [
      {
        id: "cl-1",
        name: "Ananya Deshmukh",
        category: "Clear Aligners / Cosmetic",
        city: "Pune",
        country: "India",
        phonePreview: "+91 97665 •••••",
        rating: 4.9,
        reviews: 67,
        tag: "Inquiry to Book",
        sampleScript:
          "Hello Ananya, thank you for reaching out to our dental studio. Our senior orthodontist has consultation slots open this Thursday. What time works best for you?",
      },
      {
        id: "cl-2",
        name: "James Wilson",
        category: "Sports Physio & Rehab",
        city: "Manchester",
        country: "UK",
        phonePreview: "+44 7911 ••••••",
        rating: 5.0,
        reviews: 39,
        tag: "Injury Recovery",
        sampleScript:
          "Hi James, our spine and sports physio specialists are ready to help you recover fast. Would you like to schedule an assessment call with our head therapist?",
      },
      {
        id: "cl-3",
        name: "Fatima Noor",
        category: "Dermatology & Skin Therapy",
        city: "Abu Dhabi",
        country: "UAE",
        phonePreview: "+971 55 •••••••",
        rating: 4.9,
        reviews: 51,
        tag: "VIP Patient",
        sampleScript:
          "Dear Fatima, welcome to our aesthetics clinic. We have reserved VIP consultation slots with our board-certified dermatologists. May we arrange your visit?",
      },
    ],
  },
  contractors: {
    label: "Solar & Contractors",
    icon: Wrench,
    tagline: "Property owners ready to install rooftop solar, AC maintenance, or home repairs.",
    leads: [
      {
        id: "con-1",
        name: "Rameshwar Rao",
        category: "5kW Residential Solar Rooftop",
        city: "Hyderabad",
        country: "India",
        phonePreview: "+91 98490 •••••",
        rating: 4.8,
        reviews: 35,
        tag: "Govt Subsidy Eligible",
        sampleScript:
          "Hello Rameshwar, with the latest solar subsidy, homeowners in Hyderabad can save up to 80% on monthly electricity bills. Would you like a free rooftop feasibility assessment?",
      },
      {
        id: "con-2",
        name: "Michael Chen",
        category: "HVAC System Replacement",
        city: "Phoenix, AZ",
        country: "USA",
        phonePreview: "+1 (602) •••-••••",
        rating: 4.9,
        reviews: 44,
        tag: "Emergency Install",
        sampleScript:
          "Hi Michael, we provide same-day HVAC evaluations with 10-year parts warranty. When can our certified technician stop by for your free measurement?",
      },
    ],
  },
};

export function LeadFinderShowcase() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("interior");
  const [activeLeadId, setActiveLeadId] = useState<string>("int-1");

  const currentCategory = INDUSTRY_SHOWCASE[selectedIndustry] || INDUSTRY_SHOWCASE.interior;
  const currentLead =
    currentCategory.leads.find((l) => l.id === activeLeadId) || currentCategory.leads[0];

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 md:p-10 shadow-sm space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Target className="h-3.5 w-3.5" />
            Smart Lead Discovery in Action
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Discovered Prospective Leads — Clean &amp; Ready to Close
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            See how UniCRM finds verified prospective customers for your business, verifies their WhatsApp phone numbers, and suggests the exact message to start the conversation.
          </p>
        </div>

        <Link href="/signup" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-10 px-5 text-xs font-bold bg-primary hover:opacity-90 active:opacity-80 text-primary-foreground rounded-full gap-2 shrink-0">
            <span>Find Leads in Your City</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Industry Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {Object.entries(INDUSTRY_SHOWCASE).map(([key, item]) => {
          const Icon = item.icon;
          const isSelected = selectedIndustry === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedIndustry(key);
                setActiveLeadId(item.leads[0].id);
              }}
              className={`px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Preview: Leads Table + 1-Click WhatsApp Script Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Discovered Leads List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
            <span>Discovered Leads ({currentCategory.leads.length})</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              100% WhatsApp Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {currentCategory.leads.map((lead) => {
              const isSelected = currentLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setActiveLeadId(lead.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:border-border-strong hover:bg-muted/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-none">{lead.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold whitespace-nowrap"
                        >
                          <MessageCircle className="h-2.5 w-2.5" />
                          WhatsApp Active
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground font-medium truncate">
                        {lead.category}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 opacity-70 shrink-0" />
                          <span className="truncate">{lead.city}, {lead.country}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-foreground font-medium">
                          <Phone className="h-3 w-3 opacity-70 text-emerald-500 shrink-0" />
                          <span>{lead.phonePreview}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-1 sm:pt-0 border-t border-border/50 sm:border-t-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-500 shrink-0" />
                        <span>{lead.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">({lead.reviews})</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold text-foreground border-border">
                        {lead.tag}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground italic px-1">
            &bull; Leads are pre-formatted with clean contact details so your team never spends hours cleaning spreadsheets.
          </p>
        </div>

        {/* Right Column: Pre-written 1-Click WhatsApp Conversation */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-gradient-to-b from-card via-card to-muted/20 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">1-Click Conversation Starter</div>
                <div className="text-[11px] text-muted-foreground truncate">Zero spam &bull; Polite &bull; High reply rate</div>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground shrink-0">
              Ready to Send
            </Badge>
          </div>

          {/* Chat Bubble Preview */}
          <div className="rounded-xl bg-[#25D366]/5 border border-[#25D366]/20 p-3.5 sm:p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground gap-2">
              <span className="font-semibold text-foreground truncate">To: {currentLead?.name}</span>
              <span className="font-mono text-[10px] shrink-0">{currentLead?.phonePreview}</span>
            </div>
            <div className="rounded-lg bg-card p-3 text-xs text-foreground leading-relaxed shadow-2xs border border-border break-words">
              &ldquo;{currentLead?.sampleScript}&rdquo;
            </div>
            <div className="text-[10px] text-muted-foreground text-right">
              Delivered via WhatsApp Official API / QR Gateway
            </div>
          </div>

          {/* Value Highlights */}
          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span><strong>Pre-Tagged:</strong> Automatically placed in your sales pipeline.</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span><strong>Smart Client Memory:</strong> Learns customer preferences &amp; budget as they chat.</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span><strong>Auto-Receipts on Drive:</strong> Payment confirmations saved to Google Drive.</span>
            </div>
          </div>

          <Link href="/signup" className="block pt-2">
            <Button className="w-full h-10 font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl gap-2 shadow-xs text-xs">
              <Send className="h-3.5 w-3.5" />
              <span>Start Closing Customers on WhatsApp</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
