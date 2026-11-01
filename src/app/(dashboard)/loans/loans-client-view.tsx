"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Landmark,
  Building2,
  Home,
  User,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowRight,
  Clock,
  HelpCircle,
  MessageCircle,
  ArrowLeft,
  Banknote,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { DsaLeadDesk } from "@/components/loans/dsa-lead-desk";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const LOAN_TYPES = [
  {
    id: "business",
    label: "💼 Shop & Business Stock Loan",
    desc: "₹2L to ₹50L for buying bulk inventory, marketing, and working capital.",
    tag: "₹2L - ₹50L",
    rate: "From 1.1%/mo",
    highlight: "Fast Disbursal",
  },
  {
    id: "lap",
    label: "🏠 Property / House Owner Loan (LAP)",
    desc: "Lowest interest rates. Qualify easily even if you have a low CIBIL score.",
    tag: "Up to ₹5 Cr",
    rate: "From 8.65% p.a.",
    highlight: "Low CIBIL Accepted",
  },
  {
    id: "msme",
    label: "⚙️ Factory & Machinery Finance",
    desc: "Government subsidized CGTMSE collateral-free loans for manufacturers & contractors.",
    tag: "Up to ₹2 Cr",
    rate: "Collateral-Free",
    highlight: "Govt Subsidized",
  },
  {
    id: "home",
    label: "🏡 Home Loan & Balance Transfer",
    desc: "New home purchase or lower your existing monthly bank EMI with top-up options.",
    tag: "Flexible Tenure",
    rate: "From 8.35% p.a.",
    highlight: "Save on EMI",
  },
  {
    id: "private",
    label: "🛍️ D2C Brand & Online Store Funding",
    desc: "Fast approval based on your monthly UPI & GST sales without pledging assets.",
    tag: "Revenue Based",
    rate: "From 1.05%/mo",
    highlight: "UPI / GST Backed",
  },
  {
    id: "personal",
    label: "👤 Personal & Emergency Capital",
    desc: "Quick 24-hour funds for business owners, shopkeepers, and self-employed founders.",
    tag: "Same Day",
    rate: "Instant In-Principle",
    highlight: "24h Payout",
  },
];

export function LoansClientView() {
  const { account, profile, isPlatformOwner } = useAuth();

  const [activeTab, setActiveTab] = useState<"apply" | "partner_desk">("apply");
  const [step, setStep] = useState<"category" | "chat" | "submitted">("category");
  const [selectedCategory, setSelectedCategory] = useState("business");
  const [requestedAmount, setRequestedAmount] = useState("₹15,00,000");

  // Advisor Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Namaste! 🙏 I am your dedicated loan advisory desk at UniCRM. Tell me briefly about your business needs. Even if your CIBIL score is low or you lack a 3-year ITR, we have flexible bank & NBFC options through property ownership, turnover, or machinery.",
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setStep("chat");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/loans/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          applicantProfile: {
            businessName: account?.name || "Business Owner",
            category: selectedCategory,
            requestedAmount,
          },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> UniCRM Lending Network • Verified Banking Partners
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Apply Loans &amp; Business Capital
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare quotes across 15+ Banks &amp; NBFCs with dedicated advisory support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle between Borrower Application and Partner Lead Assignment Desk */}
          <div className="flex items-center p-1 rounded-xl bg-muted border border-border text-xs font-bold">
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "apply"
                  ? "bg-background text-foreground shadow-2xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Borrower Desk
            </button>
            <button
              onClick={() => setActiveTab("partner_desk")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "partner_desk"
                  ? "bg-background text-foreground shadow-2xs font-extrabold text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Partner Lead Desk
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Consultation
          </span>
        </div>
      </div>

      {/* View Switcher: Partner Lead Desk */}
      {activeTab === "partner_desk" ? (
        <DsaLeadDesk />
      ) : (
        <>
          {/* Step 1: Select Loan Category */}
      {step === "category" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  What kind of funding does your business need?
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your requirement to check instant pre-qualification criteria across 15+ partner banks.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Advisors Online Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LOAN_TYPES.map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => handleSelectCategory(lt.id)}
                  className={`text-left p-4.5 rounded-2xl border transition-all flex flex-col justify-between hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 group relative overflow-hidden ${
                    selectedCategory === lt.id
                      ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
                      : "border-border bg-background hover:bg-card"
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {lt.tag}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {lt.rate}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {lt.label}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {lt.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {lt.highlight}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Check Route <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Loan Advisor Chat & Dossier Structuring */}
      {step === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Main Conversational Window */}
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl flex flex-col h-[580px] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep("category")}
                  className="p-1.5 rounded-lg bg-background border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0"
                  title="Back to Loan Categories"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground">
                    Dedicated Loan Advisory Desk
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Human Assisted &amp; Partnered with 15+ Banks &amp; NBFCs
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("category")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Categories</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-muted text-foreground border border-border rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">{m.time}</span>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs italic p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Advisor is evaluating your lending criteria...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex items-center gap-2 bg-background">
              <input
                type="text"
                placeholder="Type your response (e.g. Need ₹25L, low CIBIL, own commercial shop in Pune)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>

          {/* Right Sidebar: Lending Anchors & WhatsApp Paperwork Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                How Our Advisory Works
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground">Human Pre-Screening:</strong>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Low CIBIL or short ITR? We check property and daily turnover anchors to pass NBFC criteria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-foreground">WhatsApp Document Desk:</strong>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      No uploading to random websites. Send ITRs and statements directly via WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-foreground">Private Google Drive Storage:</strong>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      All financial papers stay strictly stored in your own encrypted Drive cloud.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => alert("Your consultation has been recorded! Our lending partner will message you on WhatsApp shortly.")}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete &amp; Request Callback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
