"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Building2,
  MapPin,
  Banknote,
  FileText,
  AlertCircle,
  Loader2,
  Send,
  Plus,
  Check,
  X,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PartnerWorkspace {
  id: string;
  name: string;
  ownerId?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
}

interface LoanApplication {
  id: string;
  business_name: string;
  applicant_name: string;
  phone: string;
  email: string;
  city: string;
  loan_category: string;
  amount_requested: number;
  monthly_turnover?: string;
  status: string;
  assigned_to_dsa_id?: string;
  isMasked?: boolean;
  created_at: string;
}

interface DocumentRequest {
  id: string;
  doc_type: string;
  title: string;
  status: "requested" | "uploaded" | "verified" | "rejected";
  file_url?: string;
  file_name?: string;
}

const QUICK_DOC_TEMPLATES = [
  { type: "itr_3y", title: "3 Years ITR & Computations", desc: "Latest 3 years verified income tax returns" },
  { type: "bank_6m", title: "6 Months Bank Statement", desc: "Current/savings account with bank logo" },
  { type: "gst_12m", title: "12 Months GST Returns (GSTR-3B)", desc: "Monthly GST sales summary" },
  { type: "property_deed", title: "Property Ownership Deed / Index-II", desc: "Clear legal title for LAP / mortgage" },
  { type: "kyc_pan", title: "Business PAN & Aadhaar KYC", desc: "Signatory ID verification" },
];

export function DsaLeadDesk() {
  const { isPlatformOwner } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Platform Owner Assignment State
  const [partners, setPartners] = useState<PartnerWorkspace[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/loans/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        if (data.applications?.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0]);
        }
      }
    } catch {
      toast.error("Failed to load loan leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    if (!isPlatformOwner) return;
    try {
      const res = await fetch("/api/loans/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
        if (data.partners?.length > 0) {
          setSelectedPartnerId(data.partners[0].ownerId || "");
        }
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchApplications();
    if (isPlatformOwner) {
      fetchPartners();
    }
  }, [isPlatformOwner]);

  const handleAssignLead = async (appId: string) => {
    if (!selectedPartnerId) {
      toast.error("Please select a partner to assign.");
      return;
    }
    try {
      setIsAssigning(true);
      const res = await fetch("/api/loans/applications/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          partnerUserId: selectedPartnerId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Lead assigned to partner workspace successfully!");
        await fetchApplications();
      } else {
        toast.error(data.error || "Failed to assign lead");
      }
    } catch {
      toast.error("Network error while assigning lead");
    } finally {
      setIsAssigning(false);
    }
  };

  const fetchDocuments = async (appId: string) => {
    try {
      setLoadingDocs(true);
      const res = await fetch(`/api/loans/documents?applicationId=${appId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedApp?.id) {
      fetchDocuments(selectedApp.id);
    }
  }, [selectedApp?.id]);

  const handleAcceptLead = async (appId: string) => {
    try {
      setProcessingId(appId);
      const res = await fetch("/api/loans/applications/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, action: "accept" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Lead accepted! Borrower contact unmasked.");
        // Refresh leads
        await fetchApplications();
      } else {
        toast.error(data.error || "Failed to accept lead");
      }
    } catch {
      toast.error("Network error while accepting lead");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestDocument = async (tpl: { type: string; title: string; desc: string }) => {
    if (!selectedApp) return;
    try {
      const res = await fetch("/api/loans/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          docType: tpl.type,
          title: tpl.title,
          description: tpl.desc,
        }),
      });

      if (res.ok) {
        toast.success(`Requested ${tpl.title} via WhatsApp`);
        fetchDocuments(selectedApp.id);
      }
    } catch {
      toast.error("Failed to request document");
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-muted-foreground">Loading Assigned Loan Applications...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Left Column: Assigned Leads List */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Assigned Borrower Leads ({applications.length})
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Anti-Theft Protected
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-2">
            <Banknote className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
            <h4 className="text-sm font-bold text-foreground">No Leads Assigned Yet</h4>
            <p className="text-xs text-muted-foreground">
              New pre-screened business loan files from UniCRM network will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-foreground truncate">
                      {app.business_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ₹{(app.amount_requested / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" /> {app.city}
                    </span>
                    <span className="capitalize text-foreground font-semibold">
                      {app.loan_category.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Masked status indicator */}
                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}
                    </span>
                    {app.isMasked ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Shield className="w-3 h-3" /> Contact Masked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Lead Accepted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Active Lead Details & Document Request Desk */}
      <div className="lg:col-span-7">
        {selectedApp ? (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            {/* Top Dossier Card */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
                    File ID: #{selectedApp.id.slice(0, 8)}
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">
                    {selectedApp.business_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Applicant: {selectedApp.applicant_name} &bull; {selectedApp.city}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Requested Capital</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{selectedApp.amount_requested.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Contact Information & Privacy Gate */}
              <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedApp.phone}</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedApp.email}</span>
                  </div>
                </div>

                {selectedApp.isMasked && (
                  <Button
                    onClick={() => handleAcceptLead(selectedApp.id)}
                    disabled={processingId === selectedApp.id}
                    className="btn-gold-gradient font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm"
                  >
                    {processingId === selectedApp.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Accept Lead &amp; Reveal Contact</span>
                  </Button>
                )}
              </div>

              {/* Platform Owner Lead Assignment Bar (Only visible to master admin) */}
              {isPlatformOwner && (
                <div className="mt-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Allocate Lead to Verified Partner Workspace:
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        File will immediately transfer to the partner desk with masked borrower contacts.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-medium outline-none focus:border-primary flex-1 sm:w-56"
                    >
                      {partners.length === 0 ? (
                        <option value="">No registered partner workspaces</option>
                      ) : (
                        partners.map((p) => (
                          <option key={p.id} value={p.ownerId || p.id}>
                            {p.name} ({p.ownerName})
                          </option>
                        ))
                      )}
                    </select>

                    <Button
                      size="sm"
                      onClick={() => handleAssignLead(selectedApp.id)}
                      disabled={isAssigning || !selectedPartnerId}
                      className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    >
                      {isAssigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Assign</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Collection Tracker */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  WhatsApp Document Tracker
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Stored in Customer Google Drive
                </span>
              </div>

              {/* 1-Click Request Template Chips */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground font-medium">
                  1-Click Document Requests (Dispatches to WhatsApp):
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DOC_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.type}
                      onClick={() => handleRequestDocument(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-background border border-border hover:border-emerald-500 hover:bg-emerald-500/5 transition-all shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>{tpl.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Document Requests List */}
              <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                <p className="text-[11px] font-bold text-foreground">Requested File Checklist:</p>
                {loadingDocs ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">Loading documents...</div>
                ) : documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-dashed border-border">
                    No documents requested yet. Click any chip above to send an official WhatsApp checklist to this borrower.
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-foreground">{doc.title}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">Status: {doc.status}</div>
                        </div>
                      </div>

                      {doc.status === "uploaded" && doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs"
                        >
                          View File <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground">
                          Pending Upload
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-12 text-center text-muted-foreground text-xs bg-muted/20 border border-dashed border-border rounded-2xl">
            Select a loan application from the left to view details and request documents.
          </div>
        )}
      </div>
    </div>
  );
}
