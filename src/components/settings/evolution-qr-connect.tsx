'use client';

import { useState, useEffect } from 'react';
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  LogOut,
  Server,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface EvolutionQrConnectProps {
  onSelectMetaOption?: () => void;
}

export function EvolutionQrConnect({ onSelectMetaOption }: EvolutionQrConnectProps) {
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [gatewayOffline, setGatewayOffline] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);

  // Custom Gateway configuration state (persisted in localStorage)
  const [showConfig, setShowConfig] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [gatewayKey, setGatewayKey] = useState('');

  useEffect(() => {
    let savedUrl = localStorage.getItem('unicrm_wa_gateway_url') || '';
    // Auto-heal legacy invalid fallback
    if (savedUrl === 'https://dfydude.cc.cd') {
      savedUrl = '';
      localStorage.removeItem('unicrm_wa_gateway_url');
    }
    const savedKey = localStorage.getItem('unicrm_wa_gateway_key') || '';
    setGatewayUrl(savedUrl);
    setGatewayKey(savedKey);
    if (!savedUrl) {
      setShowConfig(true);
    }
    fetchQr(savedUrl, savedKey);
  }, []);

  const fetchQr = async (customUrl?: string, customKey?: string) => {
    setLoading(true);
    setGatewayOffline(false);
    try {
      const url = customUrl !== undefined ? customUrl : gatewayUrl;
      const key = customKey !== undefined ? customKey : gatewayKey;

      const params = new URLSearchParams();
      if (url.trim()) params.set('gatewayUrl', url.trim());
      if (key.trim()) params.set('apiKey', key.trim());

      const res = await fetch(`/api/evolution/qr?${params.toString()}`);
      const data = await res.json();

      if (data.gatewayOffline) {
        setGatewayOffline(true);
        setOfflineMessage(data.message);
        setQrBase64(null);
        setConnected(false);
        if (data.needsConfiguration) {
          setShowConfig(true);
        }
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to fetch QR code');

      if (data.qr?.state === 'open') {
        setConnected(true);
        setQrBase64(null);
        setGatewayOffline(false);
      } else if (data.qr?.base64) {
        setQrBase64(data.qr.base64);
        setConnected(false);
        setGatewayOffline(false);
      } else {
        setGatewayOffline(true);
        setOfflineMessage(
          'Gateway did not return an active WhatsApp Web session. Ensure your gateway server is running.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching QR';
      setGatewayOffline(true);
      setOfflineMessage(message);
      setQrBase64(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = gatewayUrl.trim();
    if (cleanUrl) {
      localStorage.setItem('unicrm_wa_gateway_url', cleanUrl);
    } else {
      localStorage.removeItem('unicrm_wa_gateway_url');
    }
    localStorage.setItem('unicrm_wa_gateway_key', gatewayKey.trim());
    toast.success('Gateway endpoint saved! Checking connection...');
    fetchQr(cleanUrl, gatewayKey.trim());
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          gatewayUrl: gatewayUrl.trim() || undefined,
          apiKey: gatewayKey.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setConnected(false);
      toast.info('WhatsApp session disconnected');
      fetchQr();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Disconnect failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <QrCode className="h-5 w-5 text-emerald-500" />
          <span>Option 2: WhatsApp Web QR Code (&ldquo;Link Device&rdquo; with Phone)</span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
            Free Community Option
          </span>
        </CardTitle>
        <CardDescription>
          Scan the QR code with your phone&apos;s WhatsApp (Linked Devices). Zero Meta verification or credit card required.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-4 text-center">
        {connected ? (
          <div className="flex flex-col items-center gap-4 py-4 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">WhatsApp Linked & Active</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Your WhatsApp number is paired. You can send and receive messages from the CRM inbox.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading}
              className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect Device
            </Button>
          </div>
        ) : qrBase64 ? (
          <div className="flex flex-col items-center gap-4 max-w-sm">
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-white p-3 shadow-md relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrBase64} alt="WhatsApp QR Code" className="h-56 w-56 object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground text-left w-full bg-muted/40 p-3.5 rounded-xl border border-border">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-emerald-500" />
                How to link your phone:
              </p>
              <p>1. Open WhatsApp on your mobile phone</p>
              <p>2. Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> → <strong>Linked Devices</strong></p>
              <p>3. Tap <strong>Link a Device</strong> and point your camera at this QR code</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchQr()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 w-full max-w-md text-left">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs text-foreground w-full">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>WhatsApp Web Gateway Required for Real QR Pairing</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                WhatsApp encrypts QR handshakes via an active WebSocket session with WhatsApp servers. To scan with your real phone, a live UniCRM Web Gateway server must be reachable.
              </p>
              {offlineMessage && (
                <div className="mt-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/15 p-2 rounded-lg break-all">
                  {offlineMessage}
                </div>
              )}
            </div>

            {/* Quick Gateway Configuration */}
            <div className="w-full rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" />
                  UniCRM Web Gateway Endpoint
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  {showConfig ? 'Hide' : 'Configure Endpoint'}
                </button>
              </div>

              {showConfig ? (
                <form onSubmit={handleSaveGateway} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Gateway URL (with http/https)</Label>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-muted-foreground">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setGatewayUrl('https://wa.dfydude.online')}
                          className="text-primary hover:underline font-mono"
                        >
                          wa.dfydude.online
                        </button>
                        <span className="text-muted-foreground">•</span>
                        <button
                          type="button"
                          onClick={() => setGatewayUrl('http://localhost:8081')}
                          className="text-muted-foreground hover:text-foreground font-mono"
                        >
                          localhost:8081
                        </button>
                      </div>
                    </div>
                    <Input
                      placeholder="e.g. https://wa.dfydude.online or http://localhost:8081"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      className="h-8 text-xs bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Gateway Secret Key (optional)</Label>
                    <Input
                      placeholder="unicrm-gateway-secret-key"
                      value={gatewayKey}
                      onChange={(e) => setGatewayKey(e.target.value)}
                      className="h-8 text-xs bg-muted"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={loading} size="sm" className="flex-1 h-8 text-xs font-bold">
                      {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save & Check Gateway'}
                    </Button>
                    {gatewayUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setGatewayUrl('');
                          localStorage.removeItem('unicrm_wa_gateway_url');
                          fetchQr('', gatewayKey);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Cloud to Gateway Tunnel Guide */}
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] space-y-2 text-muted-foreground text-left mt-2">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      Connecting Cloud CRM to Local Gateway:
                    </p>
                    <p>
                      Because Vercel runs in the cloud, it cannot directly reach <code className="text-foreground">localhost:8081</code> on your home server without a public tunnel.
                    </p>
                    <div className="space-y-1 bg-background/80 p-2.5 rounded-lg border border-border font-mono text-[10px] text-foreground">
                      <p className="text-muted-foreground font-sans text-[11px]">Option 1: Cloudflare Named Tunnel (Permanent)</p>
                      <p className="text-primary font-bold">hostname: wa.dfydude.online &rarr; http://localhost:8081</p>
                      <p className="mt-1 text-muted-foreground font-sans text-[11px]">Option 2: Instant Quick Tunnel (Testing)</p>
                      <p className="text-emerald-500 font-bold">cloudflared tunnel --url http://localhost:8081</p>
                    </div>
                    <p className="text-[10px]">
                      Tip: Add <code className="text-foreground">EVOLUTION_URL</code> to your Vercel Project Environment Variables to connect automatically for all users.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Current endpoint:{' '}
                    {gatewayUrl ? (
                      <code className="text-foreground font-semibold">{gatewayUrl}</code>
                    ) : (
                      <span className="text-amber-500 font-medium">None (Not configured)</span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => fetchQr()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Cloud API Alternative */}
            {onSelectMetaOption && (
              <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Prefer 100% Cloud Hosting with Zero Servers?
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Use <strong>Option 1 (Official Meta WhatsApp Cloud API)</strong>. Runs natively on UniCRM Cloud with 1,000 free conversations/month directly from Meta.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectMetaOption}
                  className="mt-1 h-7 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10"
                >
                  Switch to Option 1: Meta Cloud API
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
