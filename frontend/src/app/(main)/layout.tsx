"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth(false);

  return (
    <div className="flex h-screen w-full bg-[#19201D]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0 bg-[#FDFBF7] rounded-tl-2xl border-l border-t border-[#EAE5D9]">
        <Header />
        {/* main container handles its own scrolling */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-5xl min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
