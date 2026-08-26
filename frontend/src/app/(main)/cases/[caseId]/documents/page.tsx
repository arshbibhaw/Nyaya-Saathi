"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Loader2, FileSignature, Copy, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCaseStore } from "@/store/case-store";
import { getDocument, generateDocument } from "@/lib/api";
import type { GeneratedDocument } from "@/lib/types";

export default function DocumentViewerPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const { activeCase, loadCase } = useCaseStore();
  
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCase(caseId);
    
    const fetchDoc = async () => {
      try {
        const data = await getDocument(caseId);
        setDocument(data);
      } catch (err) {
        // Only set error if it's not a 404 (meaning it hasn't been generated yet)
        if (err instanceof Error && !err.message.includes("404") && !err.message.includes("not found")) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoc();
  }, [caseId, loadCase]);

  const handleGenerate = async (docType: string = "notice") => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateDocument(caseId, docType);
      setDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (document) {
      navigator.clipboard.writeText(document.content);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href={`/cases/${caseId}/plan`}>
            <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Legal Drafts</h2>
            <p className="text-xs text-muted-foreground">
              {activeCase?.domain || "Analyzing..."}
            </p>
          </div>
        </div>
        
        {document && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-3.5" />
              PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleGenerate(document.doc_type)} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Regenerate
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          
          {isLoading ? (
             <div className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground">
               <Loader2 className="mb-4 size-8 animate-spin text-primary" />
               <p>Checking for existing drafts...</p>
             </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center mt-12">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : !document ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 flex flex-col items-center text-center p-12 glass-card border-dashed border-2"
            >
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
                <FileSignature className="size-10 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold tracking-tight">Generate Legal Document</h3>
              <p className="mb-8 max-w-md text-muted-foreground">
                Our AI will draft a formal legal notice or complaint based on the facts and evidence you provided in the chat.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="glow-indigo gap-2"
                  onClick={() => handleGenerate("notice")}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <FileSignature className="size-5" />}
                  Generate Legal Notice
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  className="gap-2"
                  onClick={() => handleGenerate("complaint")}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <FileSignature className="size-5" />}
                  Generate Complaint
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[800px] w-full rounded-sm border border-border/60 bg-white p-12 text-black shadow-lg dark:bg-zinc-100"
            >
               {/* Document Paper Preview */}
               <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed">
                  {document.content || "Document generation failed. Please regenerate."}
               </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
