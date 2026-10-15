'use client';

import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, AlertCircle, Smartphone, LogOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function EvolutionQrConnect() {
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const fetchQr = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/qr');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate QR code');

      if (data.qr?.state === 'open') {
        setConnected(true);
        setQrBase64(null);
      } else if (data.qr?.base64) {
        setQrBase64(data.qr.base64);
        setPairingCode(data.qr.pairingCode || null);
        setConnected(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching QR';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePair = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      if (!res.ok) throw new Error('Failed to connect session');
      setConnected(true);
      setQrBase64(null);
      toast.success('WhatsApp session paired and connected successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Pairing failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
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

  useEffect(() => {
    fetchQr();
  }, []);

  return (
    <Card className="border-border shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <QrCode className="h-5 w-5 text-emerald-500" />
          <span>Free WhatsApp Connection (Scan QR Code)</span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
            Zero Verification
          </span>
        </CardTitle>
        <CardDescription>
          No Meta business verification, phone number porting, or credit card required. Link your regular or Business WhatsApp by scanning this QR code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 text-center">
        {connected ? (
          <div className="flex flex-col items-center gap-4 py-4 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">WhatsApp Linked & Active</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Your WhatsApp number is paired. You can send messages, receive customer replies, and trigger automations without Meta approval.
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
              <p>1. Open WhatsApp on your mobile device</p>
              <p>2. Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> → <strong>Linked Devices</strong></p>
              <p>3. Tap <strong>Link a Device</strong> and point your camera at this QR code</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQr}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh QR
              </Button>
              <Button
                size="sm"
                onClick={handlePair}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold"
              >
                <Check className="h-4 w-4" />
                Confirm Linked
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            {loading ? (
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-500" />
            )}
            <p className="text-sm font-medium text-foreground">
              {loading ? 'Initializing WhatsApp Gateway...' : 'Generate a new QR Code to link your WhatsApp'}
            </p>
            <Button
              onClick={fetchQr}
              disabled={loading}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
            >
              <QrCode className="h-4 w-4" />
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
