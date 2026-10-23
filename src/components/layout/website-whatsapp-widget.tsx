"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface WebsiteWhatsAppWidgetProps {
  phoneNumber?: string;
  brandName?: string;
  supportTitle?: string;
  welcomeMessage?: string;
  prefilledText?: string;
}

export function WebsiteWhatsAppWidget({
  phoneNumber = "919000000000",
  brandName = "DFY UniCRM Support",
  supportTitle = "Typically replies within a few minutes",
  welcomeMessage = "Hello! 👋 Welcome to DFY UniCRM. Need help with setup, WhatsApp API, or live demo? Let us know!",
  prefilledText = "Hi DFY UniCRM team! I have a question about the CRM platform.",
}: WebsiteWhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");

  const handleSendMessage = () => {
    const textToSend = userMessage.trim() || prefilledText;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setUserMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-border/80 bg-background shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#075E54] dark:bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">
                  <MessageCircle className="h-5 w-5 fill-current" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#075E54]" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                  {brandName}
                </h3>
                <p className="text-[11px] text-white/80 leading-tight">
                  {supportTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Background / Message area */}
          <div className="p-4 bg-[#EFEAE2] dark:bg-muted/40 min-h-[140px] flex flex-col justify-end">
            <div className="bg-white dark:bg-card text-foreground rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-[85%] text-xs leading-relaxed space-y-1">
              <span className="font-bold text-[10px] text-emerald-600 block">
                {brandName}
              </span>
              <p>{welcomeMessage}</p>
              <span className="text-[9px] text-muted-foreground block text-right">
                Just now
              </span>
            </div>
          </div>

          {/* Input & Send button */}
          <div className="p-3 bg-background border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Type your message..."
              className="flex-1 text-xs bg-muted/60 border border-border rounded-full px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="h-8 w-8 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0"
              aria-label="Send WhatsApp Message"
            >
              <Send className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Action Pill / Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-3 shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 group font-bold text-xs"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="hidden sm:inline font-bold">Chat with us</span>
      </button>
    </div>
  );
}
