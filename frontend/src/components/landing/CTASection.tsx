"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass glow-violet relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next interview starts
            <br />
            with your last commit.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-mist">
            Free to try. No account required for the MVP — just upload and go.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="primary" onClick={() => router.push("/dashboard")}>
              Start Free Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 font-mono text-[12px] text-mist/60 sm:flex-row">
        <span>InterviewOS — built to demonstrate AI engineering, not to sell you anything.</span>
        <span>MVP · single-session</span>
      </div>
    </footer>
  );
}
