"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  LogOut,
  Menu,
  X,
  Scale,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileSheet } from "@/components/layout/profile-sheet";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NS";

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">
              NYAYA SAATHI
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Legal Navigator</p>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-6 px-4 py-6">
            
            {/* Overview */}
            <div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/dashboard"
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                      : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground",
                )}
              >
                <LayoutDashboard
                  className={cn(
                    "size-4",
                    pathname === "/dashboard" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                Overview
              </Link>
            </div>

            {/* CASES */}
            <div className="space-y-1">
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cases
              </h2>
              {[
                { href: "/cases", label: "All Cases", icon: FolderOpen },
                { href: "/cases?status=active", label: "Active", icon: AlertCircle },
                { href: "/cases?status=completed", label: "Completed", icon: CheckCircle2 },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ASSISTANCE */}
            <div className="space-y-1">
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assistance
              </h2>
              {[
                { href: "/action-plans", label: "Action Plans", icon: ClipboardList },
                { href: "/documents", label: "Documents", icon: FileText },
                { href: "/resources", label: "Legal Resources", icon: BookOpen },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

          </nav>
        </div>

        <Separator className="opacity-50" />

        {/* User / Help Footer */}
        <div className="p-4 space-y-1">
          <Link
            href="/help"
            className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground transition-colors"
          >
            <HelpCircle className="size-4 text-muted-foreground group-hover:text-foreground" />
            Help
          </Link>
          <div className="mt-4 flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex flex-1 items-center gap-2 min-w-0 hover:opacity-80 transition-opacity text-left"
              aria-label="Open Profile"
            >
              <Avatar className="size-8 border border-border shrink-0">
                <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-900">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.full_name ?? "User"}
                </p>
              </div>
            </button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Logout"
              className="size-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <ProfileSheet isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
