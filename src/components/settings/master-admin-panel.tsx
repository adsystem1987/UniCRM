"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Archive,
  Calendar,
  Mail,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SettingsPanelHead } from "./settings-panel-head";

interface PlatformAccount {
  id: string;
  name: string;
  owner_user_id: string;
  status: "active" | "suspended" | "phased_out";
  suspension_reason: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  owner_email: string;
  owner_name: string;
}

export function MasterAdminPanel() {
  const { isPlatformOwner, profileLoading } = useAuth();
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchAccounts = async () => {
    if (!isPlatformOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch accounts");
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to load platform accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileLoading && isPlatformOwner) {
      fetchAccounts();
    } else if (!profileLoading && !isPlatformOwner) {
      setLoading(false);
    }
  }, [profileLoading, isPlatformOwner]);

  const handleUpdateStatus = async (
    accountId: string,
    status: "active" | "suspended" | "phased_out",
    reason?: string
  ) => {
    setUpdatingId(accountId);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          status,
          suspensionReason: reason || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update account status");

      toast.success(
        status === "suspended"
          ? "Account suspended. Workspace access blocked."
          : status === "active"
            ? "Account reactivated successfully."
            : "Account marked as phased out."
      );

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                status,
                suspension_reason: status === "suspended" ? reason || "Administrative suspension" : null,
                suspended_at: status === "suspended" ? new Date().toISOString() : null,
              }
            : acc
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating account");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      acc.name.toLowerCase().includes(q) ||
      acc.owner_email.toLowerCase().includes(q) ||
      acc.owner_name.toLowerCase().includes(q) ||
      acc.id.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!profileLoading && !isPlatformOwner) {
    return (
      <Card className="p-8 text-center border-border/80 bg-muted/20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Access Restricted</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          The Platform Owner console is reserved for platform super administrators. Your account does not have sufficient platform-level permissions.
        </p>
      </Card>
    );
  }

  const getStatusBadge = (status: PlatformAccount["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
            <ShieldAlert className="h-3 w-3" />
            Suspended
          </span>
        );
      case "phased_out":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
            <Archive className="h-3 w-3" />
            Phased Out
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Platform Owner — Operations Console"
        description="Global workspace oversight, tenant lifecycle states, and moderation controls for brosir2019@gmail.com."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Workspaces</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-1">{accounts.length}</p>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Workspaces</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {accounts.filter((a) => a.status === "active").length}
          </p>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Suspended / Review</span>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-2xl font-black text-destructive mt-1">
            {accounts.filter((a) => a.status === "suspended").length}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by Workspace Name, Email, or Account ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All States ({accounts.length})</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
            <option value="phased_out">Phased Out Only</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAccounts}
            className="h-9 px-3 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Accounts List */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Platform Workspaces</CardTitle>
              <CardDescription className="text-xs">
                Manage tenant accounts, moderate abusive usage, or phase out inactive workspaces.
              </CardDescription>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? "workspace" : "workspaces"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p className="text-xs font-medium">Loading platform accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No platform accounts found matching your query.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{acc.name}</span>
                      {getStatusBadge(acc.status)}
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {acc.member_count} {acc.member_count === 1 ? "user" : "users"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-foreground font-medium">{acc.owner_email}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(acc.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {acc.suspension_reason && acc.status === "suspended" && (
                      <div className="text-[11px] text-destructive flex items-center gap-1 pt-0.5">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Reason: {acc.suspension_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {acc.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === acc.id}
                        onClick={() => {
                          const reason = prompt("Enter suspension reason (optional):", "Account suspended by platform admin");
                          if (reason !== null) {
                            handleUpdateStatus(acc.id, "suspended", reason);
                          }
                        }}
                        className="h-8 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 font-bold gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        <span>Suspend</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === acc.id}
                        onClick={() => handleUpdateStatus(acc.id, "active")}
                        className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold gap-1"
                      >
                        <Unlock className="h-3 w-3" />
                        <span>Reactivate</span>
                      </Button>
                    )}

                    {acc.status !== "phased_out" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updatingId === acc.id}
                        onClick={() => {
                          if (confirm(`Phase out workspace "${acc.name}"?`)) {
                            handleUpdateStatus(acc.id, "phased_out");
                          }
                        }}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="Phase out workspace"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
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
