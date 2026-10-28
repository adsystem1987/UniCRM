'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Save,
  Loader2,
  Share2,
  Smartphone,
  Eye,
  CalendarCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { BusinessItem } from './public-page-view';
import { BookingsDesk } from './bookings-desk';
import { INDUSTRY_PAGE_PRESETS } from '@/lib/business-page/presets';

interface BusinessPageEditorProps {
  accountId: string;
}

export function BusinessPageEditor({ accountId }: BusinessPageEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'bookings'>('editor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form states
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [callingNumber, setCallingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/business-pages?accountId=${accountId}`);
        const data = await res.json();
        if (data.page) {
          const p = data.page;
          setSlug(p.slug || '');
          setTitle(p.title || '');
          setTagline(p.tagline || '');
          setAbout(p.about || '');
          setWhatsappNumber(p.whatsapp_number || '');
          setCallingNumber(p.calling_number || '');
          setAddress(p.address || '');
          setGoogleMapsUrl(p.google_maps_url || '');
          setLogoUrl(p.logo_url || '');
          setCoverUrl(p.cover_url || '');
          setIsPublished(p.is_published ?? true);
          setItems(Array.isArray(p.items) ? p.items : []);
          setViewCount(p.view_count || 0);
          setLeadCount(p.lead_count || 0);
        } else {
          // Defaults for new page
          setSlug(`biz-${Math.random().toString(36).substring(2, 7)}`);
        }
      } catch (err) {
        console.error('Failed to load page info:', err);
      } finally {
        setLoading(false);
      }
    }

    if (accountId) {
      loadPage();
    }
  }, [accountId]);

  const handleApplyPreset = (presetId: string) => {
    const preset = INDUSTRY_PAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (!tagline) setTagline(preset.defaultTagline);
    if (!about) setAbout(preset.defaultAbout);
    
    // Append or replace items
    setItems(preset.sampleItems);
    toast.success(`Loaded sample cards for ${preset.name}!`);
  };

  const handleAddItem = () => {
    const newItem: BusinessItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      category: '',
      description: '',
      price: '',
      badge: '',
      button_label: 'Inquire on WhatsApp',
      prefill_message: '',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, key: keyof BusinessItem, value: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !whatsappNumber.trim()) {
      toast.error('Please provide Business Name, Page Slug, and WhatsApp Number.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/business-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          slug: slug.trim().toLowerCase(),
          title: title.trim(),
          tagline: tagline.trim(),
          about: about.trim(),
          whatsappNumber: whatsappNumber.trim(),
          callingNumber: callingNumber.trim(),
          address: address.trim(),
          googleMapsUrl: googleMapsUrl.trim(),
          logoUrl: logoUrl.trim(),
          coverUrl: coverUrl.trim(),
          items,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save page');
      }

      toast.success('Your Public Business Page is live!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public URL copied! Share on Instagram, Facebook, or Google Maps.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="size-6 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading your business page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Social Post Philosophy */}
      <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                <Globe className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Instant Business Micro-Page & Catalog
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Create a stunning, mobile-first business link just like posting a WhatsApp Status or Instagram Bio. 
              Put this link on Google Maps, Facebook Ads, or Instagram to capture inquiries straight into UniCRM.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-xs border border-border px-4 py-2.5 rounded-xl shadow-xs shrink-0">
            <div className="text-center">
              <span className="block text-base font-black text-foreground">{viewCount}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Views</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">{leadCount}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Inquiries</span>
            </div>
          </div>
        </div>

        {/* Live URL Bar */}
        <div className="mt-4 pt-4 border-t border-emerald-500/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-muted-foreground font-mono flex-1 overflow-hidden">
            <span className="shrink-0 text-foreground font-semibold">Your Link:</span>
            <span className="truncate text-primary">{publicUrl}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={copyUrl}
              className="text-xs gap-1.5 h-8 font-semibold"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQrModal(true)}
              className="text-xs gap-1.5 h-8 font-semibold"
            >
              <QrCode className="size-3.5" />
              QR Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(publicUrl, '_blank')}
              className="text-xs gap-1.5 h-8 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Eye className="size-3.5" />
              Preview Live
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Page Editor vs Bookings & Appointments */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === 'editor' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('editor')}
          className="text-xs h-8 gap-1.5 font-semibold"
        >
          <SlidersHorizontal className="size-3.5" />
          Page & Catalog Editor
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'bookings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('bookings')}
          className="text-xs h-8 gap-1.5 font-semibold"
        >
          <CalendarCheck className="size-3.5" />
          Appointments & Bookings Desk
        </Button>
      </div>

      {activeTab === 'bookings' ? (
        <BookingsDesk accountId={accountId} />
      ) : (
        /* Main Settings Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Business Identity */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="size-3.5 text-primary" />
              1. Business Profile (Like an Instagram Bio)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Business Name *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rohit Cabs & Airport Travels"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Custom Page URL (Slug) *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-mono">/p/</span>
                  <Input
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))
                    }
                    placeholder="rohit-cabs"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1-Line Tagline / Headline</Label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. 24/7 Outstation & Airport Cabs at Flat Rates"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">About / Description</Label>
              <Textarea
                rows={2}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell customers why they should choose you (clean cars, verified drivers, on-time guarantee)..."
                className="text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">WhatsApp Number (For Inquiries) *</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">With country code (no + or spaces)</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Calling Phone Number</Label>
                <Input
                  value={callingNumber}
                  onChange={(e) => setCallingNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Address / City</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Indiranagar, Bengaluru"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Google Maps Link</Label>
                <Input
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Logo Image URL</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cover Banner Image URL</Label>
                <Input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://.../cover.jpg"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items / Services / Catalog */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-500" />
                  2. Offers & Services (Like Instagram Posts)
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Add trips, hotel rooms, cars, menus, or services to receive direct WhatsApp bookings.
                </p>
              </div>

              <Button
                size="sm"
                onClick={handleAddItem}
                className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="size-3.5" />
                Add Offer
              </Button>
            </div>

            {/* Quick Industry Presets Bar */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
              <span className="block text-[11px] font-bold text-foreground">
                🚀 Or 1-Click Load Sample Cards for your Industry:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRY_PAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-background hover:bg-muted border border-border text-foreground transition-colors shadow-2xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-8 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  No offers or services added yet. Click an industry preset above or add a card manually.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="text-xs gap-1.5 font-semibold"
                >
                  <Plus className="size-3.5" />
                  Add First Service or Offer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        Item #{index + 1}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id)}
                        className="size-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-semibold">Offer / Item Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                          placeholder="e.g. Goa 3N/4D Holiday Package"
                          className="text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Category Tab</Label>
                        <Input
                          value={item.category || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                          placeholder="e.g. Domestic Trips / Rooms"
                          className="text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Price / Rate</Label>
                        <Input
                          value={item.price || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                          placeholder="e.g. ₹8,999 / person"
                          className="text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-semibold">Short Highlights / Details</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="e.g. 4-star resort, pool, daily breakfast, sightseeing cab included"
                          className="text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Feature Badge (Optional)</Label>
                        <Input
                          value={item.badge || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'badge', e.target.value)}
                          placeholder="e.g. Top Seller • Breakfast Inc."
                          className="text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">WhatsApp Button Label</Label>
                        <Input
                          value={item.button_label || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'button_label', e.target.value)}
                          placeholder="Book on WhatsApp"
                          className="text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Photo URL (Optional)</Label>
                        <Input
                          value={item.image_url || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'image_url', e.target.value)}
                          placeholder="https://.../hotel.jpg"
                          className="text-xs bg-background"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publishing Controls & Tips */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Publishing Status
            </h4>

            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">Make Page Public</Label>
                <p className="text-[11px] text-muted-foreground">
                  Anyone with your link can view and message you.
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-bold bg-primary text-primary-foreground hover:opacity-90 gap-1.5 shadow-md h-10"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save & Publish Page
                </>
              )}
            </Button>
          </div>

          {/* Social Media Distribution Guide */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Share2 className="size-3.5 text-primary" />
              Where to use your link
            </h4>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <p>
                  <strong className="text-foreground">Instagram Bio:</strong> Paste this URL into your profile website field.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <p>
                  <strong className="text-foreground">Google Business:</strong> Add as your official website on Google Maps so searchers can chat directly.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </div>
                <p>
                  <strong className="text-foreground">Printable QR Code:</strong> Print and stick on your counter, car dashboard, or visiting card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-foreground">
              Your Business QR Code
            </h3>
            <p className="text-xs text-muted-foreground">
              Customers can scan this on their phone camera to instantly open your page and chat on WhatsApp.
            </p>

            <div className="flex items-center justify-center py-4">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    publicUrl
                  )}`}
                  alt="QR Code"
                  className="size-48"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowQrModal(false)}
                className="flex-1 text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>${title || 'Business'} - Counter Standee</title>
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; margin: 0; background: #fff; color: #000; }
                        .standee { border: 3px solid #000; border-radius: 24px; padding: 40px; max-width: 420px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                        h1 { font-size: 26px; font-weight: 900; margin: 0 0 8px 0; }
                        p.tagline { font-size: 14px; color: #444; margin: 0 0 24px 0; font-weight: 600; }
                        .qr-box { padding: 16px; background: #fff; border: 2px dashed #000; border-radius: 16px; display: inline-block; margin-bottom: 24px; }
                        .qr-box img { width: 220px; height: 220px; display: block; }
                        .cta { font-size: 16px; font-weight: 800; background: #10b981; color: #fff; padding: 12px 20px; border-radius: 12px; margin-bottom: 12px; display: inline-block; }
                        .hint { font-size: 12px; color: #666; font-weight: 500; }
                        @media print { body { padding: 0; } .standee { box-shadow: none; border: 2px solid #000; } }
                      </style>
                    </head>
                    <body>
                      <div class="standee">
                        <h1>${title || 'Our Business'}</h1>
                        <p class="tagline">${tagline || 'Scan to view our services & chat on WhatsApp'}</p>
                        <div class="qr-box">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}" alt="QR Code" />
                        </div>
                        <br />
                        <div class="cta">💬 Scan to Chat on WhatsApp</div>
                        <p class="hint">Open Phone Camera • Scan QR Code • Instant Booking</p>
                      </div>
                      <script>
                        window.onload = function() { window.print(); }
                      </script>
                    </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Print Standee / Flyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
