"use client";

import { useState } from "react";
import { GitBranch, Loader2, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { GithubProject } from "@/lib/types";

interface GithubAnalyzeProps {
  onAnalyzed: (project: GithubProject) => void;
}

export function GithubAnalyze({ onAnalyzed }: GithubAnalyzeProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "analyzing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setStatus("analyzing");
    setError(null);

    try {
      const data = await apiFetch<{ success: boolean; project: GithubProject }>(
        "/api/github/analyze",
        {
          method: "POST",
          body: JSON.stringify({ repoUrl: repoUrl.trim() }),
        }
      );
      onAnalyzed(data.project);
      setRepoUrl("");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Analysis failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 focus-within:border-violet/40">
        <GitBranch className="h-4 w-4 shrink-0 text-mist/60" />
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="github.com/owner/repo"
          disabled={status === "analyzing"}
          className="w-full bg-transparent font-mono text-[13px] text-paper placeholder:text-mist/40 outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "analyzing" || !repoUrl.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet to-indigo px-3 py-1.5 text-[13px] font-medium text-paper transition-opacity disabled:opacity-40"
        >
          {status === "analyzing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              Analyze <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {error && <p className="font-mono text-[11px] text-red-400/90">{error}</p>}
    </form>
  );
}
