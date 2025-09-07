"use client";

import { useEffect, useState } from "react";
import { Play, Target, MessageSquareText, TrendingUp, Loader2, GitBranch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GithubAnalyze } from "./GithubAnalyze";
import { apiFetch } from "@/lib/apiClient";
import type { GithubProject } from "@/lib/types";

const stats = [
  { label: "questions practiced", value: "0", icon: MessageSquareText },
  { label: "avg. score", value: "—", icon: TrendingUp },
  { label: "topics covered", value: "0", icon: Target },
];

export function ProgressPanel() {
  const [projects, setProjects] = useState<GithubProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch<GithubProject[]>("/api/github/projects")
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {
        // treat as "no projects yet" rather than surfacing a network error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 space-y-6">
      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wide text-mist/60">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-violet-soft/70" strokeWidth={1.75} />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      {/* GitHub analysis */}
      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-mist/60">
          <GitBranch className="h-3.5 w-3.5" />
          github analysis
        </div>
        <GithubAnalyze onAnalyzed={(p) => setProjects((prev) => [p, ...prev])} />

        <div className="mt-5 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-2 text-mist">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[13px]">Loading projects…</span>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <p className="font-mono text-[11px] text-mist/50">
              no repos analyzed yet — paste a GitHub URL above
            </p>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-body text-[14px] font-medium">
                  {project.repoFullName || project.name}
                </span>
              </div>
              {project.summary && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
                  {project.summary}
                </p>
              )}
              {project.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-violet/10 px-2 py-0.5 font-mono text-[11px] text-violet-soft"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {project.architectureLayers.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-mist/70">
                  {project.architectureLayers.map((layer, i) => (
                    <span key={layer} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-mist/30">→</span>}
                      {layer}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Start interview panel */}
      <Card className="glow-violet relative overflow-hidden p-8 sm:p-10">
        <div className="max-w-md">
          <span className="font-mono text-[11px] text-signal/80">
            {"// ready when you are"}
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Start a mock interview
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-mist">
            InterviewOS will pull questions from your uploaded projects and
            target role. No setup needed beyond what&apos;s in your profile.
          </p>
          <Button size="lg" variant="primary" className="mt-6">
            <Play className="h-4 w-4" />
            Start Interview
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-wide text-mist/60">
          recent sessions
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center">
          <p className="max-w-xs text-sm text-mist">
            No sessions yet. Start your first interview to see progress here.
          </p>
        </div>
      </Card>
    </div>
  );
}
