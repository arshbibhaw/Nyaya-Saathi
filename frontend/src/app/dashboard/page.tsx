"use client";

import { useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  MoreVertical,
  Briefcase
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCaseStore } from "@/store/case-store";
import type { Case } from "@/lib/types";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const { cases, isLoading, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const activeCases = cases.filter(c => c.status !== "resolved" && c.status !== "escalated").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStatusBadge = (status: Case["status"]) => {
    switch (status) {
      case "open":
      case "analyzing":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">Active</Badge>;
      case "pending_evidence":
        return <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Action Required</Badge>;
      case "plan_generated":
        return <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Plan Ready</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-500">Completed</Badge>;
      case "escalated":
        return <Badge variant="destructive">Escalated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Mock activity timeline
  const activities = [
    { id: 1, action: "Case created", case: "Cyber Financial Fraud", time: "2 hours ago" },
    { id: 2, action: "Evidence uploaded", case: "Cyber Financial Fraud", time: "2 hours ago" },
    { id: 3, action: "Action plan generated", case: "Employment Dispute", time: "1 day ago" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have {activeCases} active matters requiring attention.
          </p>
        </div>
        <Link href="/cases/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
            <Plus className="size-4" />
            New Matter
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cases List */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Active Matters</h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : cases.length > 0 ? (
                cases.map((c) => (
                  <Link key={c.case_id} href={`/cases/${c.case_id}/chat`} className="block hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          <Briefcase className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {/* Using hackathon mock category if present or fallback */}
                              {"Cyber Financial Fraud" || c.domain}
                            </span>
                            {getStatusBadge(c.status)}
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-1 max-w-md">
                            {c.issue}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <span>ID: {c.case_id.split('-')[0].toUpperCase()}</span>
                            <span>•</span>
                            <span>{format(new Date(c.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-slate-300" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <FolderOpen className="size-8 text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No active matters</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by creating a new case.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="relative mt-1 flex h-full flex-col items-center">
                      <div className="size-2 rounded-full bg-blue-600" />
                      {i !== activities.length - 1 && (
                        <div className="absolute top-3 bottom-[-16px] w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{act.action}</p>
                      <p className="text-xs text-slate-500">{act.case}</p>
                      <p className="mt-1 text-xs font-medium text-slate-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-2">
              <nav className="flex flex-col gap-1">
                <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Upload className="mr-3 size-4 text-slate-400" /> Upload Evidence
                </Button>
                <Link href="/dashboard/plans">
                  <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <FileText className="mr-3 size-4 text-slate-400" /> View Action Plans
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <AlertCircle className="mr-3 size-4 text-slate-400" /> Legal Resources
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
