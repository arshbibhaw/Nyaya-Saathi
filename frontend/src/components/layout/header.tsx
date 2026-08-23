"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function Header() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] || "User";

  return (
    <header className="sticky top-0 z-30 flex h-24 items-center justify-between bg-transparent px-6 md:px-8 mt-2">
      <div className="flex flex-col gap-1 pl-10 md:pl-0">
        <h2 className="text-2xl font-bold tracking-tight text-[#1F2937]">Hello, {firstName}</h2>
        <p className="text-sm text-slate-500">How can we help you today?</p>
      </div>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EAE5D9] shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
        <Bell className="size-5" />
      </button>
    </header>
  );
}
