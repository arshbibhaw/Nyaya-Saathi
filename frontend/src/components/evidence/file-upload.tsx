"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  caseId: string;
  onUploadSuccess?: () => void;
}

export function FileUpload({ caseId, onUploadSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { upload, isUploading, progress, error, result, reset, validate } = useFileUpload();
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: unknown[]) => {
    setLocalError(null);
    reset();
    
    if (fileRejections.length > 0) {
      setLocalError("Invalid file type or size too large.");
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validationError = validate(file);
      if (validationError) {
        setLocalError(validationError);
      } else {
        setSelectedFile(file);
      }
    }
  }, [validate, reset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await upload(caseId, selectedFile);
      if (onUploadSuccess) onUploadSuccess();
    } catch {
      // Error handled by hook
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    reset();
    setLocalError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Dropzone */}
      {!selectedFile && !result && (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UploadCloud className="size-6 text-primary" />
          </div>
          <h3 className="mb-1 text-sm font-semibold">Click to upload or drag and drop</h3>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG or WebP (max 10MB)
          </p>
        </div>
      )}

      {/* Selected File State */}
      <AnimatePresence mode="wait">
        {selectedFile && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/10">
                <File className="size-5 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon-sm" onClick={removeFile} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading & Analyzing...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || localError) && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <p>{error || localError}</p>
        </div>
      )}

      {/* Upload Actions */}
      {selectedFile && !result && !isUploading && (
        <Button className="w-full glow-indigo" onClick={handleUpload}>
          Upload Evidence
        </Button>
      )}

      {/* Success Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-success/30 bg-success/5 p-4"
        >
          <div className="mb-4 flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" />
            <span className="font-semibold">Evidence Analyzed Successfully</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-foreground">Extracted Dates:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.extracted_entities.dates.length > 0 ? (
                  result.extracted_entities.dates.map((d, i) => (
                    <span key={i} className="rounded bg-background/50 px-2 py-0.5 text-xs border border-border/50">{d}</span>
                  ))
                ) : <span className="text-muted-foreground text-xs">None found</span>}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-foreground">Extracted Amounts:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.extracted_entities.amounts.length > 0 ? (
                  result.extracted_entities.amounts.map((a, i) => (
                    <span key={i} className="rounded bg-background/50 px-2 py-0.5 text-xs border border-border/50">{a}</span>
                  ))
                ) : <span className="text-muted-foreground text-xs">None found</span>}
              </div>
            </div>

            <div>
              <span className="font-medium text-foreground">Parties Identified:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.extracted_entities.parties.length > 0 ? (
                  result.extracted_entities.parties.map((p, i) => (
                    <span key={i} className="rounded bg-background/50 px-2 py-0.5 text-xs border border-border/50">{p}</span>
                  ))
                ) : <span className="text-muted-foreground text-xs">None found</span>}
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={removeFile}>
            Upload Another
          </Button>
        </motion.div>
      )}
    </div>
  );
}
