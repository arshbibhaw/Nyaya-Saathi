"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  FolderOpen, 
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  Briefcase,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { FadeIn } from "@/components/fade-in";
import { format } from "date-fns";

// Use highly realistic dummy data as requested
const dummyCases = [
  { id: "CASE-4921", domain: "Cyber Fraud Dispute", issue: "Unauthorized deduction of ₹45,000 from ICICI bank account", status: "pending_evidence", created_at: "2023-11-05T10:00:00Z" },
  { id: "CASE-3844", domain: "Consumer Court Notice", issue: "Defective laptop delivered by e-commerce platform, no refund issued", status: "analyzing", created_at: "2023-11-08T14:30:00Z" },
  { id: "CASE-2109", domain: "Employment Dispute", issue: "Unpaid severance and wrongful termination from tech startup", status: "plan_generated", created_at: "2023-10-22T09:15:00Z" }
];

const dummyActivities = [
  { id: 1, action: "AI analyzed your screenshots", case: "Cyber Fraud Dispute", time: "2 hours ago" },
  { id: 2, action: "Drafted Consumer Complaint", case: "Consumer Court Notice", time: "5 hours ago" },
  { id: 3, action: "Legal Action Plan generated", case: "Employment Dispute", time: "1 day ago" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for the premium feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const activeCases = dummyCases.filter(c => c.status !== "resolved").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzing":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Analyzing</Badge>;
      case "pending_evidence":
        return <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">Action Required</Badge>;
      case "plan_generated":
        return <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">Plan Ready</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            You have <span className="font-semibold text-amber-600 dark:text-amber-500">{activeCases} active matters</span> requiring attention.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/documents/new">
            <Button variant="outline" className="shadow-sm gap-2 bg-white dark:bg-slate-900 hover:-translate-y-1 transition-transform">
              <Upload className="size-4" />
              Upload Evidence
            </Button>
          </Link>
          <Link href="/cases/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 hover:-translate-y-1 transition-transform">
              <Plus className="size-4" />
              Start a New Case
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cases List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="size-5 text-blue-600" />
              Active Matters
            </h2>
            <Link href="/cases" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          
          <div className="grid gap-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              dummyCases.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <Card className="group border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <FolderOpen className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {c.domain}
                            </span>
                            {getStatusBadge(c.status)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 max-w-md mb-2">
                            {c.issue}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><FileText className="size-3"/> {c.id}</span>
                            <span className="flex items-center gap-1"><Clock className="size-3"/> {format(new Date(c.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Clock className="size-5 text-blue-600" />
              Recent Activity
            </h2>
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {dummyActivities.map((act, i) => (
                    <div key={act.id} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="size-3 rounded-full bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/30" />
                        {i !== dummyActivities.length - 1 && (
                          <div className="absolute top-4 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-800" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{act.action}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{act.case}</p>
                        <p className="mt-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
