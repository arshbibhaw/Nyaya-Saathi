"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

export function Header() {
  const { user } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const username = user?.username || user?.full_name || user?.email?.split("@")[0] || "User";
  const initials = (user?.username || user?.full_name || "NS")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-transparent px-6 md:px-8 mt-2">
        <div className="flex flex-col gap-0.5 pl-10 md:pl-0">
          <h2 className="text-2xl font-bold tracking-tight text-[#1F2937]">
            Hello, <span className="text-[#C49B63] font-serif">{username.startsWith("@") ? username : `@${username}`}</span>
          </h2>
          <p className="text-sm text-slate-500">Welcome to your legal dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDropdown />

          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-full bg-white border border-[#EAE5D9] shadow-sm px-3 py-1.5 hover:border-[#C49B63] transition-all group"
          >
            <Avatar className="size-8 bg-[#19201D] text-white">
              <AvatarFallback className="bg-[#19201D] text-[#C49B63] font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-slate-800 group-hover:text-[#C49B63] hidden sm:inline-block">
              {username.startsWith("@") ? username : `@${username}`}
            </span>
          </Link>
        </div>
      </header>

      <ProfileSheet isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
