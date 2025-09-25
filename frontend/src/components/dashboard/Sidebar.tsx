"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, FileCode2, User, Terminal, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { CandidateProfile } from "@/lib/types";
import { ResumeUpload } from "./ResumeUpload";

type LoadState = "loading" | "empty" | "ready";

export function Sidebar() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ success: boolean; profile: CandidateProfile }>("/api/resume/profile")
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setState("ready");
      })
      .catch(() => {
        // 404 (no profile yet) and network errors both land here — either
        // way, show the upload prompt rather than a scary error on first visit.
        if (cancelled) return;
        setState("empty");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="glass flex h-full w-full flex-col rounded-2xl p-5 md:w-72 md:shrink-0">
      <Link href="/" className="flex items-center gap-2 pb-5 transition-opacity hover:opacity-80">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-indigo">
          <Terminal className="h-4 w-4 text-paper" strokeWidth={2.25} />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          InterviewOS
        </span>
      </Link>

      {/* Candidate profile */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {state === "loading" && (
          <div className="flex items-center gap-2 py-2 text-mist">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[13px]">Loading profile…</span>
          </div>
        )}

        {state === "empty" && (
          <ResumeUpload
            onUploaded={(p) => {
              setProfile(p);
              setState("ready");
            }}
          />
        )}

        {state === "ready" && profile && (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet/15 text-violet-soft">
                <User className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-[14px] font-medium">
                  {profile.name || "Unnamed candidate"}
                </div>
                <div className="font-mono text-[11px] text-mist/70">
                  candidate_profile.json
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.skills.length > 0 ? (
                profile.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-violet/10 px-2 py-0.5 font-mono text-[11px] text-violet-soft"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[11px] text-mist/50">
                  no skills extracted
                </span>
              )}
            </div>
            <div className="mt-3">
              <ResumeUpload
                compact
                onUploaded={(p) => {
                  setProfile(p);
                  setState("ready");
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Projects — from resume for now; enriched once GitHub analysis (Phase 3) lands */}
      <div className="mt-6 flex-1">
        <div className="mb-2 flex items-center gap-1.5 px-1 font-mono text-[11px] uppercase tracking-wide text-mist/60">
          <FolderGit2 className="h-3.5 w-3.5" />
          projects{state === "ready" ? " (from resume)" : ""}
        </div>

        {state === "ready" && profile && profile.projects.length > 0 && (
          <div className="space-y-0.5">
            {profile.projects.map((name) => (
              <div
                key={name}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left"
              >
                <FileCode2 className="h-4 w-4 shrink-0 text-mist/70" />
                <span className="flex-1 truncate text-[13px] text-paper/85">
                  {name}
                </span>
              </div>
            ))}
          </div>
        )}

        {state === "ready" && profile && profile.projects.length === 0 && (
          <p className="px-2.5 font-mono text-[11px] text-mist/50">
            none found in resume yet
          </p>
        )}

        {(state === "loading" || state === "empty") && (
          <p className="px-2.5 font-mono text-[11px] text-mist/50">
            upload a resume to populate this
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4 font-mono text-[11px] text-mist/50">
        session · single-user MVP
      </div>
    </aside>
  );
}
