"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeQuestionPanel } from "./CodeQuestionPanel";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-40 pb-28 md:pt-48 md:pb-36">
      <div className="glow-violet absolute inset-x-0 top-0 h-[560px] -z-10" />

      <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono text-[12px] text-mist"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            reads your repos before it interviews you
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={0.1}
            variants={fadeUp}
            className="font-display text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            Build interview confidence
            <br />
            <span className="text-gradient">with an AI that read your code.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={0.22}
            variants={fadeUp}
            className="mt-7 max-w-lg text-lg leading-relaxed text-mist"
          >
            Upload your resume, connect GitHub, and practice with an interviewer
            trained on your actual projects — not a generic question bank.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={0.34}
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button size="lg" variant="primary" onClick={() => router.push("/dashboard")}>
              Start Free Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" onClick={() => router.push("/dashboard")}>
              <Code2 className="h-4 w-4" />
              Analyze my GitHub
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            custom={0.46}
            variants={fadeUp}
            className="mt-10 flex items-center gap-6 font-mono text-[12px] text-mist/70"
          >
            <span>no signup required</span>
            <span className="h-1 w-1 rounded-full bg-mist/40" />
            <span>single-session MVP</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <CodeQuestionPanel />
        </motion.div>
      </div>
    </section>
  );
}
