"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Upload your resume",
    body: "We extract your skills, experience, and named projects from the PDF.",
  },
  {
    n: "02",
    title: "Connect GitHub",
    body: "Your repos are crawled and chunked into a project knowledge base — architecture, dependencies, decisions.",
  },
  {
    n: "03",
    title: "Add a target job",
    body: "Paste a job description and InterviewOS maps its requirements against what you've actually built.",
  },
  {
    n: "04",
    title: "Interview, then improve",
    body: "Answer follow-up questions grounded in your code, and get a scored breakdown of what to work on.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-xl">
          <span className="font-mono text-[12px] text-signal/80">
            {"// pipeline"}
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From resume to ready.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] md:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className="bg-void-raised px-6 py-8"
            >
              <div className="font-mono text-sm text-violet-soft/70">
                STEP_{step.n}
              </div>
              <h3 className="mt-4 font-display text-[17px] font-medium">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-mist">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
