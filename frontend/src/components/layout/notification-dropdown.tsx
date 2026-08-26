"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, FileText, FolderOpen, Shield, Info, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Info> = {
  success: CheckCheck,
  warning: Shield,
  info: Info,
};

const COLOR_MAP: Record<string, string> = {
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  info: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
  } = useNotificationStore();

  // Initial fetch + 30s polling
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

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

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(); // Refresh on open
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        aria-label="Notifications"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EAE5D9] shadow-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[380px] max-h-[480px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
                >
                  <CheckCheck className="size-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="p-3 rounded-full bg-slate-100 mb-3">
                  <Bell className="size-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You&apos;ll be notified when cases are created or evidence is uploaded.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = ICON_MAP[notif.type] || Info;
                const colorClasses = COLOR_MAP[notif.type] || COLOR_MAP.info;
                const timeAgo = notif.created_at
                  ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })
                  : "";

                return (
                  <button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) markRead(notif.id);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50",
                      !notif.is_read && "bg-blue-50/40"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", colorClasses)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          notif.is_read ? "text-slate-600 font-medium" : "text-slate-900 font-bold"
                        )}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="shrink-0 size-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
