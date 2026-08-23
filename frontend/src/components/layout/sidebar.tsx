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

import Image from "next/image";

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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#19201D] text-white transition-transform duration-300 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center gap-3 px-6 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-white/10 shadow-md">
              <Image 
                src="/logo-mark.png" 
                alt="Nyaya Saathi Logo" 
                fill 
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-serif tracking-widest text-white leading-tight">
                NYAYA<br/>SAATHI
              </h1>
            </div>
          </div>
        </div>

        <Separator className="opacity-20 mt-4 mx-6 w-auto" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto mt-6">
          <nav className="flex flex-col gap-2 px-4">
            
            {[
              { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { href: "/queries", label: "My Queries", icon: HelpCircle },
              { href: "/cases", label: "My Cases", icon: FolderOpen },
              { href: "/documents", label: "Documents", icon: FileText },
              { href: "/resources", label: "Resources", icon: BookOpen },
              { href: "/profile", label: "Profile & Settings", icon: User },
            ].map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#28352F] text-white border border-[#3E5248]"
                      : "text-slate-400 hover:bg-[#28352F]/50 hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5",
                      isActive ? "text-[#C49B63]" : "text-slate-400 group-hover:text-[#C49B63]"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator className="opacity-20 mx-6 w-auto" />

        {/* User Footer */}
        <div className="p-4 mb-2">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl p-3 min-w-0 bg-[#28352F]/40 hover:bg-[#28352F] border border-[#3E5248]/50 transition-all text-left group"
            aria-label="Open Profile Dashboard"
          >
            <Avatar className="size-9 border border-[#C49B63]/40 bg-[#C49B63]/20 shrink-0">
              <AvatarFallback className="bg-[#C49B63] text-[#19201D] font-bold text-xs">
                {(user?.username || user?.full_name || "NS").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-white truncate leading-snug group-hover:text-[#C49B63] transition-colors">
                {user?.username ? `@${user.username}` : (user?.full_name || "My Account")}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.email || "Click for profile dashboard"}
              </span>
            </div>
          </Link>
        </div>
      </aside>

      <ProfileSheet isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
