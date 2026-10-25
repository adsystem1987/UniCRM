"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  ShieldCheck,
  ExternalLink,
  Receipt,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCheck,
  XCircle,
  QrCode,
  ArrowRight,
  Cloud,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SettingsPanelHead } from "./settings-panel-head";

interface OrderRecord {
  id: string;
  order_number: string;
  order_type: string;
  item_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  utr_number: string | null;
  whatsapp_phone: string;
  parameters: {
    niche?: string;
    city?: string;
    leads_count?: number;
    packId?: string;
  };
  status: "pending_verification" | "paid" | "fulfilled" | "cancelled";
  admin_notes: string | null;
  receipt_number?: string | null;
  receipt_gdrive_url?: string | null;
  receipt_gdrive_file_id?: string | null;
  receipt_generated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function OrdersBillingPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncingReceiptId, setSyncingReceiptId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        toast.error(data.error || "Failed to load orders");
      }
    } catch {
      toast.error("Network error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderRecord["status"]) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order");
      }
      toast.success(`Order status updated to: ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSyncToDrive = async (orderId: string) => {
    setSyncingReceiptId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver receipt to Google Drive");
      }
      toast.success(
        data.driveUrl
          ? "Receipt uploaded and synced to Google Drive!"
          : "Receipt recorded. Connect Google Drive to auto-upload."
      );
      void fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingReceiptId(null);
    }
  };

  const handlePrintReceipt = (order: OrderRecord) => {
    window.open(`/api/orders/${order.id}/receipt`, "_blank");
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.utr_number && o.utr_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.whatsapp_phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.parameters?.niche && o.parameters.niche.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "pending_verification":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3 animate-pulse" />
            Pending Verification
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Payment Verified
          </span>
        );
      case "fulfilled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCheck className="h-3 w-3" />
            Fulfilled &amp; Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="h-3 w-3" />
            Cancelled / Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Orders & Payment Tracker"
        description="Track all UPI QR and direct payments, verify customer UTR reference numbers, and manage fulfillment with 0% gateway deductions."
      />

      {/* Admin Highlight Banner */}
      {isAdmin && (
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">
                UniCRM Admin Mode Active
              </p>
              <p className="text-[11px] text-muted-foreground">
                You have permission to review UTRs against your bank app, verify payments, and mark orders as fulfilled.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchOrders}
            className="text-xs font-bold gap-1.5 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Orders
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, UTR, WhatsApp, or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Payment Verified</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Order &amp; Payment History
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-gateway direct purchases recorded via UPI QR and UTR validation.
              </CardDescription>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2 text-xs">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Loading payment records...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Receipt className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs font-bold text-foreground">No orders found</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "No orders match your filter criteria."
                  : "When you or your team purchase lead packs or add-ons, your order history and receipts will be tracked here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Order Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-[11px] text-muted-foreground">
                        • {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-foreground truncate">
                      {order.item_name}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span>
                        Amount: <strong className="text-foreground">₹{order.amount}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        WhatsApp: <strong className="text-foreground">{order.whatsapp_phone}</strong>
                      </span>
                      {order.parameters?.niche && (
                        <>
                          <span>•</span>
                          <span>
                            Target: <span className="text-foreground font-medium">{order.parameters.niche} ({order.parameters.city || "All India"})</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* UTR Reference Strip */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        UTR / Ref:
                      </span>
                      {order.utr_number ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                          <span>{order.utr_number}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.utr_number!, `utr_${order.id}`)}
                            className="text-muted-foreground hover:text-foreground p-0.5"
                          >
                            {copiedKey === `utr_${order.id}` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 font-medium italic">
                          No UTR entered yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Management */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* View / Print Receipt */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrintReceipt(order)}
                      className="h-8 px-2.5 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                      title="View printable payment receipt"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Receipt
                    </Button>

                    {/* Google Drive Delivery Link / Sync */}
                    {order.receipt_gdrive_url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(order.receipt_gdrive_url!, "_blank")}
                        className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
                        title="View receipt stored in Google Drive"
                      >
                        <Cloud className="h-3.5 w-3.5 text-blue-500" />
                        <span>Drive</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                      </Button>
                    ) : ["paid", "fulfilled"].includes(order.status) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={syncingReceiptId === order.id}
                        onClick={() => handleSyncToDrive(order.id)}
                        className="h-8 px-2 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                        title="Upload receipt to Google Drive"
                      >
                        <Cloud className={`h-3.5 w-3.5 ${syncingReceiptId === order.id ? "animate-pulse" : ""}`} />
                        <span className="hidden sm:inline">
                          {syncingReceiptId === order.id ? "Syncing..." : "Sync Drive"}
                        </span>
                      </Button>
                    ) : null}

                    {/* Admin Status Controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 border-l border-border pl-2">
                        {order.status === "pending_verification" && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "paid")}
                            className="h-8 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verify
                          </Button>
                        )}

                        {order.status === "paid" && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "fulfilled")}
                            className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Fulfill
                          </Button>
                        )}

                        {order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                            className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold"
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
