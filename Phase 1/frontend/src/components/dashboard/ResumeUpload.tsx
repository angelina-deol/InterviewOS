"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { CandidateProfile } from "@/lib/types";

interface ResumeUploadProps {
  onUploaded: (profile: CandidateProfile) => void;
  compact?: boolean;
}

export function ResumeUpload({ onUploaded, compact = false }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setError("Only PDF resumes are supported.");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const data = await apiFetch<{ success: boolean; profile: CandidateProfile }>(
        "/api/resume/upload",
        { method: "POST", body: formData }
      );

      onUploaded(data.profile);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className={
          compact
            ? "font-mono text-[11px] text-violet-soft/80 hover:text-violet-soft underline underline-offset-2 disabled:opacity-50"
            : "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet/30 bg-violet/[0.04] px-4 py-6 text-sm text-mist transition-colors hover:border-violet/50 hover:bg-violet/[0.07] disabled:opacity-60"
        }
      >
        {status === "uploading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {compact ? "Uploading…" : "Parsing resume…"}
          </>
        ) : compact ? (
          "replace resume"
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            Upload your resume (PDF)
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 font-mono text-[11px] text-red-400/90">{error}</p>
      )}
    </div>
  );
}
