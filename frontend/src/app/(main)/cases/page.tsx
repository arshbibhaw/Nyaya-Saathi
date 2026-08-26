"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Clock, 
  ArrowRight,
  Filter,
  Inbox,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/fade-in";
import { useCaseStore } from "@/store/case-store";

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { cases, isLoading, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter(c => 
    (c.title || c.domain || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
      case "action needed":
        return <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 font-medium capitalize">{status}</Badge>;
      case "analyzing":
      case "in progress":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium capitalize">{status}</Badge>;
      case "plan ready":
        return <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 font-medium capitalize">{status}</Badge>;
      case "completed":
      case "closed":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 font-medium capitalize">{status}</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <FadeIn className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display flex items-center gap-3">
            <FolderOpen className="size-8 text-blue-600" />
            Cases Directory
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage and track all your ongoing and past legal matters.
          </p>
        </div>
        <Link href="/cases/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 hover:-translate-y-1 transition-transform">
            <Plus className="size-4" />
            Start a New Case
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      ) : cases.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/20">
          <div className="flex size-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6">
            <Inbox className="size-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">No active cases found</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
            You haven't started any legal analyses yet. When you describe a problem, your case details and action plans will appear here.
          </p>
          <Link href="/cases/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
              <Plus className="size-4" />
              Analyze Your First Case
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Search cases by title or ID..." 
                className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto gap-2 bg-white dark:bg-slate-800">
              <Filter className="size-4" />
              Filter by Status
            </Button>
          </div>

          {/* Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`} className="block h-full">
                <Card className="group h-full flex flex-col border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer bg-white dark:bg-slate-900/50">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        {c.id.split('-')[0]}-{c.id.slice(-4)} {/* Short ID display */}
                      </span>
                      {getStatusBadge(c.status)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">
                      {c.domain || "Unclassified Legal Matter"}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow line-clamp-3">
                      {c.summary || c.issue}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="size-4" />
                        {format(new Date(c.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                        <ArrowRight className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No cases match your search query.
            </div>
          )}
        </>
      )}
    </FadeIn>
  );
}
