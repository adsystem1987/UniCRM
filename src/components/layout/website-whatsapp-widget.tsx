"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Phone, ArrowUpRight, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

interface WebsiteLiveChatWidgetProps {
  brandName?: string;
  supportTitle?: string;
  welcomeMessage?: string;
  officialWhatsApp?: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'system' | 'user' | 'ai';
  text: string;
  time: string;
}

export function WebsiteWhatsAppWidget({
  brandName = "DFY UniCRM Support",
  supportTitle = "Online • Instant Support",
  welcomeMessage = "Hello! 👋 Welcome to DFY UniCRM. Connect directly with our team or get instant answers to your questions.",
  officialWhatsApp = "917019139417",
}: WebsiteLiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<ChatMessageItem[]>([]);

  // Validation helper: strictly requires email or phone to stop bots & spammers
  const validateContactMethod = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const digitsOnly = trimmed.replace(/\D/g, "");
    const isPhone = digitsOnly.length >= 7 && digitsOnly.length <= 15;
    return isEmail || isPhone;
  };

  const isContactValid = validateContactMethod(emailOrPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = message.trim();
    const contactInput = emailOrPhone.trim();

    if (!queryText) {
      toast.error("Please enter a message.");
      return;
    }

    if (!isContactValid) {
      toast.error("Please enter a valid Email address or WhatsApp phone number to continue.");
      return;
    }

    const isEmail = contactInput.includes("@");
    const cleanPhone = !isEmail ? contactInput.replace(/[^\d+]/g, "") : "";
    const cleanEmail = isEmail ? contactInput : "";

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: now,
    };

    setHistory((prev) => [...prev, userMsg]);
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Website Visitor",
          email: cleanEmail,
          phone: cleanPhone,
          topic: "Website Live Chat",
          message: queryText,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.aiReply) {
          setHistory((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: data.aiReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else if (data.isHotLead) {
          setHistory((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `Thank you, ${name.trim() || 'there'}! We have marked your inquiry as priority. Our team and automations have received your details and will follow up immediately.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `Message received! Our team has been notified and automations have been initiated.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        toast.success("Verified inquiry received by UniCRM!");
      } else {
        toast.error(data.error || "Failed to deliver message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setHistory([]);
    setMessage("");
    setName("");
    setEmailOrPhone("");
  };

  const waPrefillMessage = name.trim() 
    ? `Hi UniCRM, I'm ${name.trim()} and I'd like to get started with WhatsApp CRM.`
    : `Hi UniCRM, I'd like to get started with WhatsApp CRM.`;
  const waDirectUrl = `https://wa.me/${officialWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waPrefillMessage)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* Expanded Native UniCRM Live Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center font-bold text-primary-foreground border border-primary-foreground/20">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight leading-tight">
                  {brandName}
                </h3>
                <p className="text-[11px] opacity-90 leading-tight">
                  {supportTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Direct WhatsApp Handshake Banner (Verified & Instant) */}
          <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Direct WhatsApp Handshake</span>
            </div>
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-md transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>Open WhatsApp</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          {/* Chat Content Body */}
          <div className="p-4 bg-muted/30 max-h-[300px] overflow-y-auto flex flex-col space-y-3">
            {/* System Welcome Bubble */}
            <div className="bg-background border border-border text-foreground rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-[92%] text-xs leading-relaxed space-y-1">
              <span className="font-bold text-[10px] text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {brandName}
              </span>
              <p>{welcomeMessage}</p>
              <span className="text-[9px] text-muted-foreground block text-right">
                Live
              </span>
            </div>

            {/* Conversation turns */}
            {history.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-card border border-border text-foreground rounded-tl-xs"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <span className="font-bold text-[10px] text-primary flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI Assistant
                    </span>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-right ${
                      msg.sender === "user"
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {submitting && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-[11px] italic">AI Assistant is thinking...</span>
              </div>
            )}
          </div>

          {/* Input & Form Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-card border-t border-border space-y-2">
            {history.length === 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Email or WhatsApp *"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className={`text-xs bg-muted/50 border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 transition-colors ${
                      emailOrPhone.trim().length > 0 && !isContactValid
                        ? "border-destructive focus:ring-destructive"
                        : "border-border focus:ring-primary"
                    }`}
                  />
                </div>
                {emailOrPhone.trim().length > 0 && !isContactValid ? (
                  <p className="text-[10px] text-destructive leading-tight px-1">
                    Please provide a valid email (e.g. name@company.com) or phone number (with country code).
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground leading-tight px-1">
                    🔒 Verification required to prevent spam and link your CRM automations.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isContactValid || history.length > 0 ? "Ask anything or request pricing..." : "Enter Email/Phone above first..."}
                disabled={history.length === 0 && !isContactValid}
                className="flex-1 text-xs bg-muted/50 border border-border rounded-full px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={submitting || !message.trim() || (history.length === 0 && !isContactValid)}
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {history.length > 0 && (
              <div className="flex justify-between items-center pt-1 px-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  Verified contact inquiry saved
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="hover:text-primary transition-colors font-medium"
                >
                  Clear chat
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Floating Action Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 font-bold text-xs"
        aria-label="Chat with us"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="hidden sm:inline font-bold">Chat with us</span>
      </button>
    </div>
  );
}
