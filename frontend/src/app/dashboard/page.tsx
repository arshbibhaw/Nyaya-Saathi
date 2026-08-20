"use client";

import { useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Upload,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCaseStore } from "@/store/case-store";
import type { Case } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { cases, isLoading, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const activeCases = cases.filter(c => c.status !== "resolved" && c.status !== "escalated").length;
  const resolvedCases = cases.filter(c => c.status === "resolved").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStatusBadge = (status: Case["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Open</Badge>;
      case "pending_evidence":
        return <Badge className="bg-warning/20 text-warning hover:bg-warning/30 border-none">Needs Evidence</Badge>;
      case "analyzing":
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Analyzing</Badge>;
      case "plan_generated":
        return <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-none">Plan Ready</Badge>;
      case "resolved":
        return <Badge className="bg-success/20 text-success hover:bg-success/30 border-none">Resolved</Badge>;
      case "escalated":
        return <Badge variant="destructive">Escalated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of your legal matters.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-none bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cases
            </CardTitle>
            <FolderOpen className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : cases.length}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Issues
            </CardTitle>
            <Clock className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : activeCases}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <CheckCircle2 className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : resolvedCases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Cases</h2>
          {cases.length > 0 && (
            <Link href="/cases/new">
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="size-4" />
                New Case
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl opacity-20" />
            ))}
          </div>
        ) : cases.length > 0 ? (
          <div className="grid gap-4">
            {cases.map((c) => (
              <Link key={c.case_id} href={`/cases/${c.case_id}/chat`}>
                <Card className="glass-card group cursor-pointer border-none transition-all hover:bg-surface-glass-hover hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {c.domain}
                        </span>
                        {getStatusBadge(c.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {c.issue}
                      </p>
                      <span className="text-xs text-muted-foreground opacity-70">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="glass-card flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <FolderOpen className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No cases yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Create a new case by describing your legal problem, and our AI will guide you through the process.
            </p>
            <Link href="/cases/new">
              <Button className="glow-indigo gap-2">
                <Plus className="size-4" />
                Create Your First Case
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/cases/new">
            <Button variant="outline" className="w-full justify-start gap-3 h-14 glass-hover border-border/50">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Plus className="size-4" />
              </div>
              New Legal Issue
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start gap-3 h-14 glass-hover border-border/50">
            <div className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Upload className="size-4" />
            </div>
            Upload Evidence
          </Button>
          <Link href="/dashboard/plans">
            <Button variant="outline" className="w-full justify-start gap-3 h-14 glass-hover border-border/50">
              <div className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success">
                <FileText className="size-4" />
              </div>
              View Action Plans
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start gap-3 h-14 glass-hover border-border/50">
            <div className="flex size-8 items-center justify-center rounded-md bg-warning/10 text-warning">
              <AlertCircle className="size-4" />
            </div>
            Get Help
          </Button>
        </div>
      </div>
    </div>
  );
}
