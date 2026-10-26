"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface WebsiteLiveChatWidgetProps {
  brandName?: string;
  supportTitle?: string;
  welcomeMessage?: string;
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
  welcomeMessage = "Hello! 👋 Welcome to DFY UniCRM. Have a question about WhatsApp calling, setup, or features? Message us right here!",
}: WebsiteLiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<ChatMessageItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = message.trim();
    if (!queryText) {
      toast.error("Please enter a message.");
      return;
    }

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
          email: emailOrPhone.includes("@") ? emailOrPhone.trim() : "visitor@dfyunicrm.com",
          phone: !emailOrPhone.includes("@") ? emailOrPhone.trim() : "",
          topic: "Website Live Chat",
          message: queryText,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.aiReply) {
          // Instant Option A AI Assistant Reply
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
          // Hot Lead acknowledgment
          setHistory((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `Thank you, ${name.trim() || 'there'}! We have marked your inquiry as priority. A dedicated specialist is reviewing this right now and will contact you directly.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `Message received! Our team has been notified and will reply shortly.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        toast.success("Message received by UniCRM Inbox!");
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
    setHistory([]);
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
          <div className="p-4 bg-muted/30 max-h-[320px] overflow-y-auto flex flex-col space-y-3">
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
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything or request pricing..."
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
            {history.length > 0 && (
              <div className="flex justify-between items-center pt-1 px-1 text-[10px] text-muted-foreground">
                <span>Inquiry saved to UniCRM</span>
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
