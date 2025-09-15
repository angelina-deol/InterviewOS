"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Square, Bot, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";
import type { Interview, InterviewMessage } from "@/lib/types";

const MODE_LABELS: Record<string, string> = {
  technical: "Technical Interview",
  deep_dive: "Project Deep Dive",
  behavioral: "Behavioral Interview",
};

export function InterviewRoom({ interviewId }: { interviewId: string }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [answer, setAnswer] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ success: boolean; interview: Interview; messages: InterviewMessage[] }>(
      `/api/interviews/${interviewId}`
    )
      .then((data) => {
        if (cancelled) return;
        setInterview(data.interview);
        setMessages(data.messages);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || waiting || interview?.status !== "active") return;

    const submittedAnswer = answer.trim();
    setAnswer("");
    setWaiting(true);
    setError(null);

    // Optimistically show the candidate's answer immediately
    setMessages((prev) => [
      ...prev,
      {
        id: `optimistic-${Date.now()}`,
        interviewId,
        role: "candidate",
        content: submittedAnswer,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const data = await apiFetch<{ success: boolean; messages: InterviewMessage[] }>(
        `/api/interviews/${interviewId}/respond`,
        { method: "POST", body: JSON.stringify({ answer: submittedAnswer }) }
      );
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get the next question.");
    } finally {
      setWaiting(false);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      const data = await apiFetch<{ success: boolean; interview: Interview }>(
        `/api/interviews/${interviewId}/end`,
        { method: "POST" }
      );
      setInterview(data.interview);
    } catch {
      // if ending fails, the interview just stays active — not worth blocking the user over
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-mist">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading interview…</span>
      </div>
    );
  }

  if (notFound || !interview) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-mist">Couldn&apos;t find that interview.</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const isActive = interview.status === "active";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wide text-violet-soft/80">
            {MODE_LABELS[interview.mode] || interview.mode}
          </div>
          <h1 className="mt-1 font-display text-xl font-semibold">
            {interview.role}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
              isActive ? "bg-signal/10 text-signal" : "bg-white/5 text-mist/60"
            }`}
          >
            {isActive ? "active" : "completed"}
          </span>
          {isActive && (
            <Button size="sm" variant="ghost" onClick={handleEnd} disabled={ending}>
              <Square className="h-3.5 w-3.5" />
              End Interview
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Left: transcript */}
        <Card className="flex max-h-[65vh] flex-col overflow-hidden p-0">
          <div className="border-b border-white/5 px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-mist/60">
            transcript
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "candidate" ? "flex-row-reverse text-right" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === "interviewer" ? "bg-violet/15 text-violet-soft" : "bg-white/10 text-mist"
                  }`}
                >
                  {m.role === "interviewer" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </span>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    m.role === "interviewer"
                      ? "bg-violet/[0.08] text-paper/90"
                      : "bg-white/[0.05] text-paper/85"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {waiting && (
              <div className="flex items-center gap-2 text-mist/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-[13px]">Thinking of a follow-up…</span>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </Card>

        {/* Right: answer area */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-mist/60">
              your answer
            </div>
            {isActive ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer…"
                  rows={8}
                  disabled={waiting}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[14px] leading-relaxed text-paper placeholder:text-mist/40 outline-none focus:border-violet/40 disabled:opacity-60"
                />
                <Button type="submit" variant="primary" disabled={!answer.trim() || waiting} className="w-full">
                  {waiting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Answer
                </Button>
                {error && <p className="font-mono text-[11px] text-red-400/90">{error}</p>}
              </form>
            ) : (
              <p className="text-sm text-mist">
                This interview has ended. Thanks for practicing!
              </p>
            )}
          </Card>

          {/* Feedback placeholder — Phase 5, not built yet */}
          <Card className="p-5">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-mist/60">
              feedback
            </div>
            <p className="text-[13px] leading-relaxed text-mist/70">
              Scored feedback on technical depth, communication, and confidence is coming in a future phase.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
