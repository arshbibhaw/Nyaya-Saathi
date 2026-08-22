"use client";

import { useState, useCallback } from "react";
import { uploadEvidence } from "@/lib/api";
import type { EvidenceResponse } from "@/lib/types";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_SIZE_MB = 10;

interface UseFileUploadReturn {
  upload: (caseId: string, file: File) => Promise<EvidenceResponse>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: EvidenceResponse | null;
  reset: () => void;
  validate: (file: File) => string | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceResponse | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Accepted: PDF, PNG, JPG, WebP.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const upload = useCallback(
    async (caseId: string, file: File): Promise<EvidenceResponse> => {
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        throw new Error(validationError);
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress since fetch doesn't support native progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const res = await uploadEvidence(caseId, file);
        clearInterval(progressInterval);
        setProgress(100);
        setResult(res);
        setIsUploading(false);
        return res;
      } catch (err) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setProgress(0);
        const msg =
          err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        throw err;
      }
    },
    [validate],
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { upload, isUploading, progress, error, result, reset, validate };
}
