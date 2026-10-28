'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  MessageCircle,
  Loader2,
  CalendarCheck,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface BookingRecord {
  id: string;
  page_id: string;
  account_id: string;
  contact_id?: string | null;
  name: string;
  phone: string;
  booking_date: string;
  time_slot: string;
  item_id?: string | null;
  item_title?: string | null;
  notes?: string | null;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  whatsapp_notification_status?: 'sent' | 'failed' | 'pending';
  whatsapp_message_id?: string | null;
  created_at: string;
}

interface BookingsDeskProps {
  accountId: string;
}

export function BookingsDesk({ accountId }: BookingsDeskProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business-pages/bookings?accountId=${accountId}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.error || 'Failed to load bookings');
      }
    } catch {
      toast.error('Network error loading bookings');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingRecord['status'], notify: boolean = true) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch('/api/business-pages/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          accountId,
          status: newStatus,
          notifyCustomer: notify,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        toast.success(`Booking marked as ${newStatus}${notify ? ' (WhatsApp alert sent)' : ''}`);
      } else {
        toast.error(data.error || 'Failed to update booking');
      }
    } catch {
      toast.error('Network error updating booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        (b.item_title && b.item_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Total Bookings</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{bookings.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-xs">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Confirmed / Upcoming</span>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{confirmedCount}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 shadow-xs">
          <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Completed</span>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Cancelled</span>
          <p className="text-xl font-bold text-muted-foreground mt-0.5">{cancelledCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="text-xs h-8"
          >
            All ({bookings.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setFilter('confirmed')}
            className="text-xs h-8"
          >
            Upcoming ({confirmedCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className="text-xs h-8"
          >
            Completed ({completedCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setFilter('cancelled')}
            className="text-xs h-8"
          >
            Cancelled ({cancelledCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone..."
              className="pl-8 text-xs h-8"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchBookings}
            disabled={loading}
            className="h-8 px-2.5 text-xs text-muted-foreground"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-border rounded-xl">
          <Loader2 className="size-6 animate-spin text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Loading appointments...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card/50">
          <CalendarCheck className="size-8 text-muted-foreground/60 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">No bookings found</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            When clients book an appointment slot on your public micro-page, they will appear here automatically with instant WhatsApp reminders.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {filteredBookings.map((b) => (
            <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    {b.name}
                  </span>
                  <Badge
                    variant={
                      b.status === 'confirmed'
                        ? 'default'
                        : b.status === 'completed'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {b.status}
                  </Badge>
                  {b.whatsapp_notification_status === 'sent' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <Send className="size-2.5" />
                      WhatsApp Notified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Calendar className="size-3 text-primary" />
                    {b.booking_date}
                  </span>
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Clock className="size-3 text-primary" />
                    {b.time_slot}
                  </span>
                  <a
                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                  >
                    <MessageCircle className="size-3 text-emerald-500" />
                    {b.phone}
                  </a>
                </div>

                {b.item_title && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Service:</span> {b.item_title}
                  </p>
                )}
                {b.notes && (
                  <p className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded-md">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {b.status === 'confirmed' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'completed', true)}
                      className="text-xs h-8 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'cancelled', true)}
                      className="text-xs h-8 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      <XCircle className="size-3.5 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                {b.status === 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === b.id}
                    onClick={() => handleUpdateStatus(b.id, 'confirmed', true)}
                    className="text-xs h-8"
                  >
                    Re-open
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
