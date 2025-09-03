"use client";

import { motion } from "framer-motion";
import { GitBranch, MessagesSquare, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: GitBranch,
    tag: "[github]",
    title: "Your projects become the interview database",
    body: "InterviewOS reads your repositories — READMEs, source, commit history — and builds a knowledge base of what you actually shipped.",
  },
  {
    icon: MessagesSquare,
    tag: "[interview]",
    title: "Practice a realistic technical interview",
    body: "Architecture questions, project deep-dives, and behavioral prompts — with follow-ups grounded in the code you wrote, not a script.",
  },
  {
    icon: LineChart,
    tag: "[feedback]",
    title: "Understand exactly how to improve",
    body: "Every answer is scored on technical depth, communication, and confidence, with specific notes on what to sharpen before the real thing.",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Not a question generator.
          </h2>
          <p className="mt-4 text-lg text-mist">
            An AI technical interviewer that understands your engineering
            identity and helps you communicate it clearly.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
            >
              <Card className="group h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet-soft">
                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[11px] text-mist/60">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-display text-lg font-medium leading-snug">
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-mist">
                  {f.body}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
