"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface WebsiteLiveChatWidgetProps {
  brandName?: string;
  supportTitle?: string;
  welcomeMessage?: string;
}

export function WebsiteWhatsAppWidget({
  brandName = "DFY UniCRM Support",
  supportTitle = "Online • Instant Support",
  welcomeMessage = "Hello! 👋 Welcome to DFY UniCRM. Have a question about WhatsApp calling, setup, or features? Message us right here!",
}: WebsiteLiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: name.trim() || "Website Visitor",
          email: emailOrPhone.includes("@") ? emailOrPhone.trim() : "visitor@dfyunicrm.com",
          phone: !emailOrPhone.includes("@") ? emailOrPhone.trim() : "",
          topic: "Website Live Chat",
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setSent(true);
        toast.success("Message sent directly to UniCRM Inbox!");
      } else {
        toast.error("Failed to deliver message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setMessage("");
    setName("");
    setEmailOrPhone("");
  };

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

          {/* Chat Content Body */}
          <div className="p-4 bg-muted/30 min-h-[160px] flex flex-col justify-end space-y-3">
            {/* System Welcome Bubble */}
            <div className="bg-background border border-border text-foreground rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-[90%] text-xs leading-relaxed space-y-1">
              <span className="font-bold text-[10px] text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {brandName}
              </span>
              <p>{welcomeMessage}</p>
              <span className="text-[9px] text-muted-foreground block text-right">
                Live
              </span>
            </div>

            {/* Success state */}
            {sent && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Message delivered to our CRM team!</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Our agents will respond to you right away.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* Input & Form Area */}
          {!sent && (
            <form onSubmit={handleSubmit} className="p-3 bg-card border-t border-border space-y-2">
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
                  placeholder="Email or WhatsApp"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 text-xs bg-muted/50 border border-border rounded-full px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0 disabled:opacity-50"
                  aria-label="Send Message"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </form>
          )}
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
