"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Mail, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTopic?: string;
}

export function ContactDialog({
  open,
  onOpenChange,
  defaultTopic = "General Inquiry",
}: ContactDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          topic,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      toast.success("Message sent! We'll reply to your email shortly.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error sending inquiry";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Mail className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-black">Contact Support Desk</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Have a question or need assistance? Fill out this form and our team will get back to you at your email.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Message Received!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you, <strong>{name}</strong>. Your inquiry has been forwarded directly to <strong>ravibabuche@dfydude.online</strong>. We will respond as quickly as possible.
            </p>
            <Button onClick={handleReset} className="mt-4 font-bold">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ravi Kumar"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ravi@company.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  WhatsApp / Phone
                </Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Inquiry Topic
              </Label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="General Inquiry">General Question about UniCRM</option>
                <option value="Optional VIP Support (₹1,000/mo)">Optional Done-For-You VIP Setup (₹1,000/mo)</option>
                <option value="Technical Help">Technical Help / Bug Report</option>
                <option value="Custom Integration">Custom Integration / API</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                How Can We Help You? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you need help with..."
                rows={4}
                required
                disabled={submitting}
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Sent to: ravibabuche@dfydude.online
              </span>
              <Button type="submit" disabled={submitting} className="font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
