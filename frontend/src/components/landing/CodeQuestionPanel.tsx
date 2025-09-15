"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CODE_LINES: { tokens: { text: string; cls?: string }[] }[] = [
  { tokens: [{ text: "class ", cls: "text-violet-soft" }, { text: "ThreatClassifier" }, { text: ":" }] },
  { tokens: [{ text: "    def ", cls: "text-violet-soft" }, { text: "__init__" }, { text: "(self):" }] },
  { tokens: [{ text: "        self.model = " }, { text: "RandomForestClassifier(", cls: "text-signal" }] },
  { tokens: [{ text: "            n_estimators=" }, { text: "200", cls: "text-signal" }, { text: "," }] },
  { tokens: [{ text: "            max_depth=" }, { text: "12", cls: "text-signal" }, { text: "," }] },
  { tokens: [{ text: "        )" }] },
];

const QUESTION =
  "Why Random Forest instead of a neural net for flow classification?";

function usesReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function CodeQuestionPanel() {
  const [typed, setTyped] = useState(() => (usesReducedMotion() ? QUESTION : ""));
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (usesReducedMotion()) return;

    let i = 0;
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i += 1;
        setTyped(QUESTION.slice(0, i));
        if (i >= QUESTION.length) clearInterval(interval);
      }, 28);
    }, 1400);

    const blink = setInterval(() => setShowCursor((c) => !c), 500);

    return () => {
      clearTimeout(startDelay);
      clearInterval(blink);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      className="glass relative w-full max-w-[520px] rounded-2xl overflow-hidden"
    >
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <span className="font-mono text-[12px] text-mist">
          sentinel_flow<span className="text-violet-soft">.py</span>
        </span>
        <span className="font-mono text-[11px] text-mist/60">read-only</span>
      </div>

      {/* code pane */}
      <div className="px-5 py-4 font-mono text-[13px] leading-[1.7]">
        {CODE_LINES.map((line, idx) => (
          <div key={idx} className="whitespace-pre text-paper/85">
            {line.tokens.map((t, j) => (
              <span key={j} className={t.cls}>
                {t.text}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* transform arrow */}
      <div className="flex items-center gap-2 px-5 py-1 text-violet-soft/70">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
        <ArrowRight className="h-4 w-4 shrink-0" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
      </div>

      {/* interview question bubble */}
      <div className="px-5 pb-5 pt-2">
        <div className="rounded-xl border border-violet/25 bg-violet/[0.07] px-4 py-3">
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-signal/80">
            AI interviewer
          </div>
          <p className="font-body text-[14px] leading-relaxed text-paper/90 min-h-[42px]">
            {typed}
            <span
              className="inline-block w-[2px] h-[14px] translate-y-[2px] bg-violet-soft ml-0.5"
              style={{ opacity: showCursor ? 1 : 0 }}
            />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
