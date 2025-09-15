"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";
import type { GithubProject, Interview, InterviewMessage, InterviewMode } from "@/lib/types";

const MODES: { value: InterviewMode; label: string; description: string }[] = [
  { value: "technical", label: "Technical", description: "Algorithms, architecture, debugging" },
  { value: "deep_dive", label: "Project Deep Dive", description: "Grounded in one of your analyzed repos" },
  { value: "behavioral", label: "Behavioral", description: "Past experience, STAR-style" },
];

interface StartInterviewFormProps {
  projects: GithubProject[];
}

export function StartInterviewForm({ projects }: StartInterviewFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topicsToFocus, setTopicsToFocus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const needsProject = mode === "deep_dive";
  const canSubmit = role.trim() && (!needsProject || projectId) && status !== "starting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("starting");
    setError(null);

    try {
      const data = await apiFetch<{ success: boolean; interview: Interview; messages: InterviewMessage[] }>(
        "/api/interviews/start",
        {
          method: "POST",
          body: JSON.stringify({
            mode,
            role: role.trim(),
            experience: experience.trim(),
            topicsToFocus: topicsToFocus.trim(),
            ...(needsProject ? { projectId } : {}),
          }),
        }
      );
      router.push(`/interview/${data.interview.id}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not start the interview.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode picker */}
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
              mode === m.value
                ? "border-violet/50 bg-violet/[0.08]"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            <div className="font-body text-[13px] font-medium">{m.label}</div>
            <div className="mt-0.5 text-[11px] text-mist/70">{m.description}</div>
          </button>
        ))}
      </div>

      {needsProject && (
        <div>
          {projects.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 px-3 py-2.5 font-mono text-[11px] text-mist/60">
              analyze a GitHub repo above first — deep dive needs one to ground questions in
            </p>
          ) : (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[13px] text-paper outline-none focus:border-violet/40"
            >
              <option value="">Select an analyzed project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-void-raised">
                  {p.repoFullName || p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role (e.g. Backend Engineer)"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] text-paper placeholder:text-mist/40 outline-none focus:border-violet/40 sm:col-span-1"
        />
        <input
          type="text"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Years of experience"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] text-paper placeholder:text-mist/40 outline-none focus:border-violet/40"
        />
        <input
          type="text"
          value={topicsToFocus}
          onChange={(e) => setTopicsToFocus(e.target.value)}
          placeholder="Focus topics (optional)"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] text-paper placeholder:text-mist/40 outline-none focus:border-violet/40"
        />
      </div>

      <Button type="submit" size="lg" variant="primary" disabled={!canSubmit}>
        {status === "starting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        Start Interview
      </Button>

      {error && <p className="font-mono text-[11px] text-red-400/90">{error}</p>}
    </form>
  );
}
