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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const LOAN_TYPES = [
  { id: "business", label: "💼 Shop & Business Stock Loan", desc: "₹2L to ₹50L for buying bulk inventory, marketing, and working capital" },
  { id: "lap", label: "🏠 Property / House Owner Loan (LAP)", desc: "Lowest interest rates. Qualify easily even if you have a low CIBIL score" },
  { id: "msme", label: "⚙️ Factory & Machinery Finance", desc: "Government subsidized CGTMSE loans for contractors and manufacturers" },
  { id: "home", label: "🏡 Home Loan & Balance Transfer", desc: "New home purchase or lower your existing monthly bank EMI" },
  { id: "private", label: "🛍️ D2C Brand & Online Store Funding", desc: "Fast approval based on your monthly UPI & GST sales" },
  { id: "personal", label: "👤 Personal & Emergency Loan", desc: "Fast 24-hour funds for business owners and self-employed" },
];

export function LoansClientView() {
  const { account, profile } = useAuth();

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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" /> UniCRM Capital Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Apply Loans &amp; Business Capital
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare quotes across 15+ Banks &amp; NBFCs with AI Pre-Screening.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Consultation
          </span>
        </div>
      </div>

      {/* Step 1: Select Loan Category */}
      {step === "category" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-1">
              What kind of funding does your business need?
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Select the option that best matches your situation to get the highest approval chance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {LOAN_TYPES.map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => handleSelectCategory(lt.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between hover:border-amber-500 hover:bg-amber-500/5 group ${
                    selectedCategory === lt.id
                      ? "border-amber-500 bg-amber-500/10 shadow-xs"
                      : "border-border bg-background"
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {lt.label}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {lt.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <span>Explore Route</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: AI Loan Advisor Chat & Dossier Structuring */}
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
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
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
                        ? "bg-amber-600 text-white rounded-br-xs"
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  AI Advisor is evaluating lending criteria...
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
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-40 shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>

          {/* Right Sidebar: Lending Anchors & WhatsApp Paperwork Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                How UniCRM Capital Works
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground">AI Pre-Screens Your Strength:</strong>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Low CIBIL or short ITR? Our AI finds property or turnover anchors to pass NBFC criteria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
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
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
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
    </div>
  );
}
