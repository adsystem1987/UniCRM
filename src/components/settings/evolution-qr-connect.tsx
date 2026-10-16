'use client';

import { useState, useEffect } from 'react';
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  LogOut,
  ExternalLink,
  Server,
  Key,
  ShieldAlert,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function EvolutionQrConnect() {
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
    const savedUrl = localStorage.getItem('unicrm_wa_gateway_url') || '';
    const savedKey = localStorage.getItem('unicrm_wa_gateway_key') || '';
    setGatewayUrl(savedUrl);
    setGatewayKey(savedKey);
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
          'Gateway did not return an active WhatsApp Web session. Ensure your gateway container is running.'
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
    localStorage.setItem('unicrm_wa_gateway_url', gatewayUrl.trim());
    localStorage.setItem('unicrm_wa_gateway_key', gatewayKey.trim());
    toast.success('Gateway endpoint saved! Checking connection...');
    fetchQr(gatewayUrl.trim(), gatewayKey.trim());
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
          <span>Free WhatsApp Web Connection (QR Code)</span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
            Community Option
          </span>
        </CardTitle>
        <CardDescription>
          Link your WhatsApp by scanning a QR code with your phone. (Or use the Official Meta Cloud API below for 100% cloud hosting).
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
                WhatsApp encrypts QR handshakes via an active WebSocket session with WhatsApp servers. To scan with your real phone, a live Gateway server (Evolution API) must be connected.
              </p>
            </div>

            {/* Quick Gateway Configuration */}
            <div className="w-full rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" />
                  Connect Self-Hosted Gateway Server
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
                    <Label className="text-[11px] text-muted-foreground">Gateway URL (with http/https)</Label>
                    <Input
                      placeholder="e.g. https://wa.yourdomain.com or http://localhost:8081"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      className="h-8 text-xs bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">API Key (optional)</Label>
                    <Input
                      placeholder="unicrm-evolution-secret-key"
                      value={gatewayKey}
                      onChange={(e) => setGatewayKey(e.target.value)}
                      className="h-8 text-xs bg-muted"
                    />
                  </div>
                  <Button type="submit" disabled={loading} size="sm" className="w-full h-8 text-xs font-bold">
                    {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save & Generate Real QR'}
                  </Button>
                </form>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Running Evolution API on Docker? Click <strong>Configure Endpoint</strong> to enter your server URL.
                </p>
              )}
            </div>

            {/* Recommended Zero-Server Solution */}
            <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Recommended: Official Meta WhatsApp Cloud API
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                No Docker containers or servers needed! Configure your Phone Number ID and System User Token in the form directly below. 100% cloud-hosted on Vercel with 1,000 free conversations/month directly from Meta.
              </p>
              <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                <ArrowDown className="h-3 w-3" /> Fill in the Meta Cloud API form below
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
