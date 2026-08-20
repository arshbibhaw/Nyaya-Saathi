"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/cases/new": "New Case",
  "/dashboard/plans": "Action Plans",
  "/dashboard/documents": "Documents",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (const segment of segments) {
    path += `/${segment}`;
    // Skip dynamic segments like [caseId]
    const label = segment.startsWith("[")
      ? segment
      : segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  // Match exact or parent route for title
  const title =
    routeTitles[pathname] ??
    crumbs[crumbs.length - 1]?.label ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/60 px-6 backdrop-blur-lg md:px-8">
      <div className="flex flex-col gap-0.5 pl-10 md:pl-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

        {/* Breadcrumbs */}
        {crumbs.length > 1 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" />}
                {i < crumbs.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <Link href="/cases/new">
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Case
        </Button>
      </Link>
    </header>
  );
}
