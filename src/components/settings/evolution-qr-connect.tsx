'use client';

import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function EvolutionQrConnect() {
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchQr = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evolution/qr');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate QR code');

      if (data.qr?.base64) {
        setQrBase64(data.qr.base64);
        setConnected(false);
      } else if (data.qr?.state === 'open') {
        setConnected(true);
        setQrBase64(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching QR';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQr();
  }, []);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-5 w-5 text-emerald-500" />
          Free WhatsApp Connection (Scan QR Code)
        </CardTitle>
        <CardDescription>
          No Meta business verification or credit card required. Link your regular or Business WhatsApp by scanning this QR code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 text-center">
        {connected ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h4 className="font-semibold text-foreground">WhatsApp Connected!</h4>
            <p className="text-xs text-muted-foreground">Your instance is linked and ready to send & receive messages.</p>
          </div>
        ) : qrBase64 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
              <img src={qrBase64} alt="WhatsApp QR Code" className="h-56 w-56 object-contain" />
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">How to connect:</p>
              <p>1. Open WhatsApp on your mobile phone</p>
              <p>2. Tap Menu (Android) or Settings (iPhone) → <strong>Linked Devices</strong></p>
              <p>3. Tap <strong>Link a Device</strong> and point your camera at this screen</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQr}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh QR Code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-500" />
            )}
            <p className="text-sm text-muted-foreground">
              {loading ? 'Initializing WhatsApp instance...' : 'Click below to generate a new QR Code'}
            </p>
            <Button onClick={fetchQr} disabled={loading} size="sm">
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
