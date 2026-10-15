"use client";

import { useState } from "react";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Contact } from "@/types";

interface VoiceCallModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCallModal({ contact, isOpen, onClose }: VoiceCallModalProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  const startCall = async () => {
    if (!contact?.phone) {
      toast.error("Contact has no phone number");
      return;
    }

    setIsCalling(true);
    try {
      const res = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: contact.phone,
          contactId: contact.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      setCallId(data.callId);
      setCallActive(true);
      toast.success("Calling contact via WhatsApp Voice...");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error initiating call";
      toast.error(message);
    } finally {
      setIsCalling(false);
    }
  };

  const endCall = async () => {
    if (callId) {
      try {
        await fetch(`/api/calls/${encodeURIComponent(callId)}/hangup`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Error hanging up call:", err);
      }
    }
    setCallActive(false);
    setCallId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            WhatsApp Voice Call
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 text-center">
          {/* Libraries.dev inspired Voice / Glow Audio Orb */}
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            {callActive && (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/20 opacity-75" />
                <span className="absolute inline-flex h-20 w-20 animate-pulse rounded-full bg-emerald-500/30 blur-md" />
              </>
            )}
            <div className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
              callActive 
                ? "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/40" 
                : "bg-muted text-muted-foreground"
            }`}>
              {callActive ? (
                <PhoneCall className="h-7 w-7 animate-bounce" />
              ) : (
                <Phone className="h-7 w-7" />
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold">{contact?.name || "Customer"}</h3>
          <p className="text-sm text-muted-foreground">{contact?.phone}</p>
          <p className="mt-2 text-xs font-medium text-emerald-500 flex items-center gap-1.5 justify-center">
            {callActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live VoIP Audio (via Whatomate Engine)
              </>
            ) : (
              "Ready to connect via WhatsApp Voice"
            )}
          </p>
        </div>


        <DialogFooter className="flex sm:justify-center gap-3">
          {callActive ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-12 w-12 rounded-full"
              >
                {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant="destructive"
                onClick={endCall}
                className="h-12 w-12 rounded-full p-0"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              disabled={isCalling}
              onClick={startCall}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Phone className="h-4 w-4" />
              {isCalling ? "Connecting..." : "Start Call"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
