"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Mail, ShieldCheck, Phone, CheckCircle2, KeyRound } from "lucide-react";
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
  const [contactMode, setContactMode] = useState<'whatsapp' | 'email'>('whatsapp');
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<ChatMessageItem[]>([]);

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Validation helpers
  const cleanPhoneDigits = whatsappPhone.replace(/\D/g, "");
  const isWhatsappValid = cleanPhoneDigits.length >= 10 && cleanPhoneDigits.length <= 15;
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Overall validity based on user's chosen contact method
  const isContactValid =
    contactMode === 'whatsapp'
      ? isWhatsappValid
      : isEmailFormatValid && isEmailVerified;

  // Handler: Send 6-digit verification code via Unitpost
  const handleSendEmailOtp = async () => {
    if (!isEmailFormatValid) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/contact/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpToken(data.token);
        setOtpExpiresAt(data.expiresAt);
        toast.success(`Verification code sent to ${email.trim()}`);
      } else {
        toast.error(data.error || "Failed to send verification code. Try again.");
      }
    } catch {
      toast.error("Network error while sending code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handler: Verify 6-digit code
  const handleVerifyOtp = async () => {
    if (!enteredOtp.trim() || enteredOtp.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/contact/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: email.trim(),
          code: enteredOtp.trim(),
          token: otpToken,
          expiresAt: otpExpiresAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.verified) {
        setIsEmailVerified(true);
        toast.success("Email verified successfully! You can now send your message.");
      } else {
        toast.error(data.error || "Invalid code. Please try again.");
      }
    } catch {
      toast.error("Network error during verification.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = message.trim();

    if (!queryText) {
      toast.error("Please enter a message.");
      return;
    }

    if (!isContactValid) {
      if (contactMode === 'whatsapp') {
        toast.error("Please provide a valid 10-15 digit WhatsApp number.");
      } else {
        toast.error("Please verify your email with the 6-digit code to continue.");
      }
      return;
    }

    const cleanPhone = contactMode === 'whatsapp' ? cleanPhoneDigits : "";
    const cleanEmail = contactMode === 'email' ? email.trim() : "";

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
              text: `Thank you, ${name.trim() || 'there'}! We have marked your inquiry as priority. Our team has received your details and will follow up with you directly.`,
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
    setWhatsappPhone("");
    setEmail("");
    setOtpSent(false);
    setOtpToken(null);
    setOtpExpiresAt(null);
    setEnteredOtp("");
    setIsEmailVerified(false);
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
          <div className="p-4 bg-muted/30 max-h-[280px] overflow-y-auto flex flex-col space-y-3">
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
                {/* Contact Mode Selection Tabs */}
                <div className="flex items-center justify-between gap-1 p-0.5 bg-muted/60 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setContactMode('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-semibold text-[11px] transition-all ${
                      contactMode === 'whatsapp'
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Phone className="h-3 w-3 text-emerald-500" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMode('email')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-semibold text-[11px] transition-all ${
                      contactMode === 'email'
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mail className="h-3 w-3 text-blue-500" />
                    <span>Email Code</span>
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />

                  {contactMode === 'whatsapp' ? (
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Number (e.g. +91 9876543210) *"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className={`w-full text-xs bg-muted/50 border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 transition-colors ${
                          whatsappPhone.trim().length > 0 && !isWhatsappValid
                            ? "border-destructive focus:ring-destructive"
                            : "border-border focus:ring-primary"
                        }`}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 px-1">
                        🔒 Enter your 10-15 digit WhatsApp number for follow-up.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          required
                          placeholder="Your Email Address *"
                          value={email}
                          disabled={isEmailVerified}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`flex-1 text-xs bg-muted/50 border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 transition-colors disabled:opacity-60 ${
                            isEmailVerified
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : email.trim().length > 0 && !isEmailFormatValid
                              ? "border-destructive focus:ring-destructive"
                              : "border-border focus:ring-primary"
                          }`}
                        />
                        {!isEmailVerified && (
                          <button
                            type="button"
                            disabled={!isEmailFormatValid || sendingOtp}
                            onClick={handleSendEmailOtp}
                            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                          >
                            {sendingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
                            <span>{otpSent ? "Resend" : "Send Code"}</span>
                          </button>
                        )}
                      </div>

                      {/* OTP Input row if sent and not yet verified */}
                      {otpSent && !isEmailVerified && (
                        <div className="flex items-center gap-1.5 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-24 text-center tracking-widest font-mono text-xs font-bold bg-background border border-border rounded-md py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            disabled={enteredOtp.length !== 6 || verifyingOtp}
                            onClick={handleVerifyOtp}
                            className="flex-1 text-[11px] font-bold py-1 px-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {verifyingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            <span>Verify Email</span>
                          </button>
                        </div>
                      )}

                      {isEmailVerified && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 px-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Email verified! You can now send your inquiry.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  history.length > 0 || isContactValid
                    ? "Ask anything or request pricing..."
                    : contactMode === 'whatsapp'
                    ? "Enter WhatsApp number above first..."
                    : "Verify your email above first..."
                }
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
