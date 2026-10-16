'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Globe,
  ExternalLink,
  QrCode,
  Smartphone,
  Sparkles,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const COLOR_PRESETS = [
  { name: 'WhatsApp Green', color: '#25D366' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Royal Blue', color: '#2563eb' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Midnight', color: '#0f172a' },
];

export function ChatWidgetPanel() {
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('Customer Support');
  const [greeting, setGreeting] = useState('Hi there! 👋 How can we help you today?');
  const [prefilledMessage, setPrefilledMessage] = useState(
    'Hi! I was visiting your website and have a question.'
  );
  const [brandColor, setBrandColor] = useState('#25D366');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [originUrl, setOriginUrl] = useState('');

  // Fetch account's configured phone number as sensible default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }

    const loadConfig = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!profile?.account_id) return;

      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('display_phone_number')
        .eq('account_id', profile.account_id)
        .maybeSingle();

      if (config?.display_phone_number) {
        setPhone(config.display_phone_number.replace(/\D/g, ''));
      }
    };

    loadConfig();
  }, []);

  const cleanPhone = phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanPhone}${
    prefilledMessage ? `?text=${encodeURIComponent(prefilledMessage)}` : ''
  }`;

  const embedScript = `<!-- UniCRM WhatsApp Floating Chat Widget -->
<script 
  src="${originUrl || 'https://your-crm-domain.com'}/widget.js" 
  data-phone="${cleanPhone || '1234567890'}" 
  data-brand="${brandName}" 
  data-color="${brandColor}" 
  data-greeting="${greeting.replace(/"/g, '&quot;')}" 
  data-message="${prefilledMessage.replace(/"/g, '&quot;')}" 
  data-position="${position}" 
  async>
</script>`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedScript);
      setCopiedCode(true);
      toast.success('Widget embed code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(waUrl);
      setCopiedLink(true);
      toast.success('Direct WhatsApp link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    waUrl
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          Website WhatsApp Chat Widget
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert your website visitors into WhatsApp leads. Copy the 1-line script onto your
          WordPress, Shopify, Webflow, or custom site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Customization Controls */}
        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Widget Customization
            </h3>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                WhatsApp Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 15551234567 (with country code)"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Include country code without + or spaces (e.g. 1 for US, 44 for UK, 91 for India).
              </p>
            </div>

            {/* Brand / Header Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Brand / Business Name
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. UniCRM Support"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Greeting */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Popup Greeting Message
              </label>
              <Textarea
                rows={2}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Message shown inside the chat bubble"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Pre-filled Message */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Visitor Pre-filled Message (Optional)
              </label>
              <Input
                value={prefilledMessage}
                onChange={(e) => setPrefilledMessage(e.target.value)}
                placeholder="Text pre-populated when WhatsApp opens"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Color Picker & Presets */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Brand Color Theme
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-28 font-mono text-xs uppercase"
                />
                <div className="flex items-center gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      title={p.name}
                      onClick={() => setBrandColor(p.color)}
                      style={{ backgroundColor: p.color }}
                      className={cn(
                        'h-6 w-6 rounded-full border transition-transform hover:scale-110',
                        brandColor.toLowerCase() === p.color.toLowerCase()
                          ? 'border-white ring-2 ring-primary ring-offset-1'
                          : 'border-transparent'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Widget Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPosition('right')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-all text-center',
                    position === 'right'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  )}
                >
                  Bottom Right (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setPosition('left')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-all text-center',
                    position === 'left'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  )}
                >
                  Bottom Left
                </button>
              </div>
            </div>
          </div>

          {/* Embed Code Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                1-Line Embed Script
              </h3>
              <Button size="sm" onClick={copyCode} className="h-8 gap-1.5 text-xs">
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Script'}
              </Button>
            </div>

            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-[11px] font-mono text-foreground border border-border/60">
              {embedScript}
            </pre>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                <span>Direct Link:</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-mono">
                  {waUrl.slice(0, 32)}...
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="h-7 text-xs border-border"
              >
                {copiedLink ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview & QR Code */}
        <div className="space-y-5 lg:col-span-6">
          {/* Mock Browser Frame */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-md bg-card/60 px-6 py-0.5 text-[11px] text-muted-foreground font-mono">
                your-website.com
              </div>
              <div className="w-10" />
            </div>

            {/* Mock Page Content */}
            <div className="relative min-h-[380px] bg-slate-950 p-6 flex flex-col justify-between overflow-hidden">
              <div className="space-y-3 opacity-30 select-none">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-3 w-64 rounded bg-muted/60" />
                <div className="h-3 w-52 rounded bg-muted/60" />
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-lg bg-muted/40" />
                  <div className="h-20 rounded-lg bg-muted/40" />
                  <div className="h-20 rounded-lg bg-muted/40" />
                </div>
              </div>

              {/* Realistic Floating Widget in Preview */}
              <div
                className={cn(
                  'absolute bottom-4 flex flex-col items-end z-20 transition-all duration-200',
                  position === 'right' ? 'right-4 items-end' : 'left-4 items-start'
                )}
              >
                {/* Popup Window */}
                {previewOpen && (
                  <div className="mb-3 w-72 rounded-2xl bg-white text-gray-900 shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                    {/* Header */}
                    <div
                      style={{ backgroundColor: brandColor }}
                      className="p-3.5 text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{brandName}</p>
                          <span className="text-[10px] opacity-90 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            Online
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(false)}
                        className="text-white/80 hover:text-white text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Chat Bubble Body */}
                    <div className="p-3 bg-[#e5ddd5] bg-radial-pattern">
                      <div className="rounded-lg rounded-tl-none bg-white p-2.5 text-xs text-gray-800 shadow-sm leading-relaxed">
                        {greeting}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-2.5 bg-white border-t border-gray-100">
                      <a
                        href={cleanPhone ? waUrl : '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{ backgroundColor: brandColor }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Start Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Floating Button */}
                <button
                  type="button"
                  onClick={() => setPreviewOpen((v) => !v)}
                  style={{ backgroundColor: brandColor }}
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>

          {/* Printable QR Code Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                Printable WhatsApp QR Code
              </h3>
              <a
                href={qrCodeUrl}
                download="whatsapp-lead-qr.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                <Download className="h-3 w-3" />
                Download QR
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="rounded-lg border border-border bg-white p-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="WhatsApp QR Code" className="h-28 w-28 object-contain" />
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground text-center sm:text-left">
                <p className="font-medium text-foreground">Scan with any phone camera</p>
                <p>
                  Place this QR code on invoices, posters, business cards, menus, or shop windows to
                  direct customers straight into your UniCRM WhatsApp inbox.
                </p>
                {cleanPhone && (
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Targets: +{cleanPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
