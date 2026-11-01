'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Building2,
  ChevronRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface PhoneVerificationModalProps {
  open: boolean
  onVerified: () => void
}

export function PhoneVerificationModal({ open, onVerified }: PhoneVerificationModalProps) {
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [officialWhatsApp, setOfficialWhatsApp] = useState('917019139417')
  const [phoneInput, setPhoneInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'choose' | 'business_act'>('choose')
  const [settingRole, setSettingRole] = useState(false)

  const handleChooseCustomer = async () => {
    try {
      setSettingRole(true)
      const res = await fetch('/api/auth/set-user-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'customer' }),
      })
      if (res.ok) {
        toast.success('Welcome to the Customer Portal!')
        onVerified()
      } else {
        toast.error('Failed to set role, please try again.')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSettingRole(false)
    }
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/phone-verify')
      if (res.ok) {
        const data = await res.json()
        if (data.verified) {
          onVerified()
          return
        }
        setCode(data.code)
        if (data.official_whatsapp) {
          setOfficialWhatsApp(data.official_whatsapp)
        }
        if (data.phone) {
          setPhoneInput(data.phone)
        }
      }
    } catch (err) {
      console.error('[phone-verify-modal] error:', err)
    } finally {
      setLoading(false)
    }
  }, [onVerified])

  useEffect(() => {
    if (open) {
      fetchStatus()
    }
  }, [open, fetchStatus])

  // Poll every 3 seconds while modal is open to auto-unlock as soon as WhatsApp inbound is received
  useEffect(() => {
    if (!open) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/phone-verify')
        if (res.ok) {
          const data = await res.json()
          if (data.verified) {
            toast.success('WhatsApp number verified successfully!')
            clearInterval(interval)
            onVerified()
          }
        }
      } catch {
        // Ignore network polling blips
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [open, onVerified])

  const copyCode = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Verification code copied')
  }

  const handleManualCheck = async () => {
    setVerifying(true)
    try {
      const res = await fetch('/api/auth/phone-verify')
      const data = await res.json()
      if (data.verified) {
        toast.success('Verification confirmed! Welcome to your workspace.')
        onVerified()
      } else {
        toast.info('Handshake not detected yet. Please ensure you sent the WhatsApp message.')
      }
    } catch {
      toast.error('Failed to verify status. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const waText = `Verify ${code || ''} for my UniCRM workspace`
  const waUrl = `https://wa.me/${officialWhatsApp}?text=${encodeURIComponent(waText)}`

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="w-full sm:max-w-md p-6 bg-card border-border shadow-2xl [&>button]:hidden"
        showCloseButton={false}
      >
        {mode === 'choose' ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <DialogHeader className="space-y-2 text-center items-center">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-1 border border-emerald-500/25">
                <ShieldCheck className="size-6 text-emerald-500" />
              </div>
              <DialogTitle className="text-xl font-black text-foreground">
                Welcome to UniCRM Network
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                How would you like to use UniCRM today? Choose your account role below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-1">
              {/* Option 1: Customer / Borrower / Retail Order Tracking */}
              <button
                onClick={handleChooseCustomer}
                disabled={settingRole}
                className="w-full p-4 rounded-2xl border border-border bg-background hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left flex items-start gap-3.5 group shadow-xs"
              >
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Continue as Customer
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      Zero Setup
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Apply for business/home loans, track file status, and view D2C WhatsApp orders. No database or agency setup required.
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-600 transition-all shrink-0 mt-3" />
              </button>

              {/* Option 2: Business Workspace Setup (For DSAs, Agencies & Merchants) */}
              <button
                onClick={() => setMode('business_act')}
                className="w-full p-4 rounded-2xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start gap-3.5 group shadow-xs"
              >
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Building2 className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      Business Workspace Desk
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Agency / DSA
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    For business owners, DSAs, and sales teams managing leads, WhatsApp QR inboxes, team members &amp; BYOD Google Drive.
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 mt-3" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-muted-foreground">
                100% Free Forever &bull; You can switch or upgrade roles anytime
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <DialogHeader className="space-y-2 text-center items-center">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-1 border border-primary/25">
                <Building2 className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Activate Your Business Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                To prevent spammers and maintain 100% free server access, please verify your official WhatsApp number via a <strong>1-click free handshake</strong>.
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Preparing activation handshake...</p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Handshake instructions */}
                <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Your One-Time Activation Code:
                    </span>
                    <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {code || 'ACT-******'}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Click below to send a free WhatsApp message to UniCRM Official Support (<strong>+{officialWhatsApp}</strong>). Your dashboard will unlock automatically.
                  </p>

                  {/* 1-Click WhatsApp Button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-sm active:scale-[0.98] transition-all">
                      <MessageSquare className="size-4" />
                      Send &amp; Verify via WhatsApp
                      <ExternalLink className="size-3.5 ml-auto opacity-75" />
                    </Button>
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    Copy Code
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={verifying}
                    onClick={handleManualCheck}
                    className="h-8 gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        I Sent The Message
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('choose')}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    &larr; Back to account choice
                  </button>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> 100% Free
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
