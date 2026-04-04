"use client";

import { useState } from "react";
import {
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

type ActionType = "message" | "alert" | "pricing" | "notification" | "resolution" | "check";

interface FeedItem {
  id: string;
  type: ActionType;
  agent: string;
  agentLabel: string;
  summary: string;
  detail?: string;
  timestamp: string;
  guest?: string;
}

// ─── Demo feed data ───────────────────────────────────────────────────────

const DEMO_FEED: FeedItem[] = [
  {
    id: "1",
    type: "alert",
    agent: "aria-sentinel",
    agentLabel: "Sentinel",
    summary: "Room service delay flagged — Suite 412",
    detail: "Order has been waiting 38 minutes. Threshold is 25 minutes. Escalating to duty manager.",
    timestamp: "2 min ago",
    guest: "Mr. Tadesse",
  },
  {
    id: "2",
    type: "message",
    agent: "aria-core",
    agentLabel: "Core",
    summary: "WhatsApp message sent to Mr. Tadesse",
    detail: "\"We sincerely apologise for the delay. Your order is on its way and a complimentary dessert has been added.\"",
    timestamp: "2 min ago",
    guest: "Mr. Tadesse",
  },
  {
    id: "3",
    type: "pricing",
    agent: "aria-pulse",
    agentLabel: "Pulse",
    summary: "Suite rate adjusted +12% — high demand detected",
    detail: "Occupancy above 87%. Dynamic pricing activated for superior and suite categories.",
    timestamp: "5 min ago",
  },
  {
    id: "4",
    type: "check",
    agent: "aria-vera",
    agentLabel: "Vera",
    summary: "Loyalty check: Ms. Haile — 4th visit, risk elevated",
    detail: "Guest has not engaged with loyalty programme. Soft-touch welcome offered at check-in.",
    timestamp: "11 min ago",
    guest: "Ms. Haile",
  },
  {
    id: "5",
    type: "notification",
    agent: "aria-echo",
    agentLabel: "Echo",
    summary: "Google review monitored — 3-star, response drafted",
    detail: "Review mentions slow check-in. ARIA drafted a professional reply awaiting manager approval.",
    timestamp: "18 min ago",
  },
  {
    id: "6",
    type: "resolution",
    agent: "aria-sentinel",
    agentLabel: "Sentinel",
    summary: "Incident resolved — Room 208 noise complaint",
    detail: "Adjacent room was notified. Follow-up confirmed by floor manager at 09:42.",
    timestamp: "32 min ago",
    guest: "Mr. & Mrs. Kebede",
  },
];

// ─── Icon map ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ActionType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}> = {
  message:      { icon: MessageCircle,  color: "text-primary",                               bg: "bg-primary/10",         label: "Message" },
  alert:        { icon: AlertTriangle,  color: "text-amber-600 dark:text-amber-400",         bg: "bg-amber-500/10",       label: "Alert" },
  pricing:      { icon: TrendingUp,     color: "text-emerald-600 dark:text-emerald-400",     bg: "bg-emerald-500/10",     label: "Pricing" },
  notification: { icon: Bell,           color: "text-blue-600 dark:text-blue-400",           bg: "bg-blue-500/10",        label: "Monitoring" },
  resolution:   { icon: CheckCircle2,   color: "text-emerald-600 dark:text-emerald-400",     bg: "bg-emerald-500/10",     label: "Resolved" },
  check:        { icon: Clock,          color: "text-muted-foreground",                      bg: "bg-muted/40",           label: "Check" },
};

// ─── Single feed item ─────────────────────────────────────────────────────

function FeedItemRow({ item }: { item: FeedItem }) {
  const [open, setOpen] = useState(false);
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-muted/20">
          {/* Icon */}
          <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
            <Icon className={cn("size-3.5", cfg.color)} strokeWidth={1.75} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-foreground leading-snug">{item.summary}</p>
              <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{item.timestamp}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-2.5" strokeWidth={1.75} />
                {item.agentLabel}
              </span>
              {item.guest && (
                <span className="text-[10px] text-muted-foreground">{item.guest}</span>
              )}
              <span className={cn("text-[9px] font-semibold uppercase tracking-wider", cfg.color)}>
                {cfg.label}
              </span>
            </div>
          </div>

          <ChevronRight
            className={cn(
              "mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-90"
            )}
            strokeWidth={1.75}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {open && item.detail && (
        <div className="mx-3 mb-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] leading-relaxed text-foreground/85 italic">{item.detail}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main feed ────────────────────────────────────────────────────────────

interface ActionFeedProps {
  items?: FeedItem[];
}

export function ActionFeed({ items = DEMO_FEED }: ActionFeedProps) {
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-foreground">What ARIA did recently</h3>
          <p className="text-[10px] text-muted-foreground">Plain-language log of every automated action — click a row for detail</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="block size-1.5 rounded-full bg-emerald-500 animate-breathe" />
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping-slow opacity-40" />
          </div>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Live</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Refresh feed"
          >
            <RefreshCw className={cn("size-3.5", refreshed && "animate-spin")} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-dashed border-border">
              <Sparkles className="size-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Run a test scenario above to see ARIA in action</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.map((item) => (
              <FeedItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5">
        <p className="text-[10px] text-muted-foreground">
          Showing most recent {items.length} action{items.length !== 1 ? "s" : ""}. Full history available in the activity log.
        </p>
      </div>
    </div>
  );
}
