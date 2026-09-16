"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Brain,
  Info,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface GISNotification {
  id: string;
  title: string;
  description: string;
  category: "alert" | "task" | "layer" | "system";
  timestamp: string;
  timeAgo: string;
  read: boolean;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: GISNotification[] = [
  {
    id: "notif-1",
    title: "Kinnaur Steep Slope Anomaly",
    description: "Spatial Copilot flagged high landslide risk in AOI buffer #104 along NH-05.",
    category: "alert",
    timestamp: "2026-09-03T10:45:00Z",
    timeAgo: "15m ago",
    read: false,
    link: "/ai",
  },
  {
    id: "notif-2",
    title: "PostGIS Buffer Analysis Complete",
    description: "Geodesic 500m containment generated for 1,420 infrastructure points.",
    category: "task",
    timestamp: "2026-09-03T09:30:00Z",
    timeAgo: "1h ago",
    read: false,
    link: "/analysis",
  },
  {
    id: "notif-3",
    title: "New Forest Cadastral Layer Published",
    description: "Forest & Wildlife Dept uploaded Shimla_Division_Boundary_v2.geojson (4.8 MB).",
    category: "layer",
    timestamp: "2026-09-03T08:15:00Z",
    timeAgo: "3h ago",
    read: false,
    link: "/layers",
  },
  {
    id: "notif-4",
    title: "Spatial Database Integrity Check",
    description: "PostGIS topology verification passed for all departmental datasets.",
    category: "system",
    timestamp: "2026-09-02T22:00:00Z",
    timeAgo: "Yesterday",
    read: true,
    link: "/settings",
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "alert" | "task">("all");
  const [notifications, setNotifications] = useState<GISNotification[]>(DEFAULT_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("geovision_notifications");
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Save changes
  const saveNotifications = (updated: GISNotification[]) => {
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("geovision_notifications", JSON.stringify(updated));
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "alert") return n.category === "alert";
    if (activeFilter === "task") return n.category === "task" || n.category === "layer";
    return true;
  });

  const getCategoryIcon = (category: GISNotification["category"]) => {
    switch (category) {
      case "alert":
        return <AlertTriangle size={15} className="text-amber-500" />;
      case "task":
        return <CheckCircle2 size={15} className="text-emerald-500" />;
      case "layer":
        return <Layers size={15} className="text-sky-500" />;
      case "system":
      default:
        return <Info size={15} className="text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
        title="GIS Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold font-mono text-primary-foreground shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 p-3.5 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Spatial Alerts & Updates</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-border/40 px-3 py-1.5 bg-muted/10 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                activeFilter === "all" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("alert")}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                activeFilter === "alert" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Alerts ({notifications.filter((n) => n.category === "alert").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("task")}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                activeFilter === "task" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Jobs & Layers ({notifications.filter((n) => n.category === "task" || n.category === "layer").length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 size={24} className="mx-auto mb-1.5 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">All caught up</p>
                <p className="mt-0.5 text-[11px]">No notifications matching this filter</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`group relative flex items-start gap-3 p-3 transition-colors ${
                    item.read ? "bg-transparent opacity-80" : "bg-primary/[0.03] hover:bg-primary/[0.06]"
                  }`}
                >
                  {/* Category icon circle */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!item.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <p className={`text-xs truncate ${item.read ? "font-medium text-foreground" : "font-bold text-foreground"}`}>
                          {item.title}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {item.timeAgo}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {item.description}
                    </p>

                    {item.link && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Link
                          href={item.link}
                          onClick={() => {
                            markAsRead(item.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                        >
                          <span>Open details</span>
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Individual Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted absolute top-2 right-2 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 bg-muted/30 p-2 text-center text-[10px] text-muted-foreground">
            GeoVision State Disaster & Resource Monitoring System
          </div>
        </div>
      )}
    </div>
  );
}
