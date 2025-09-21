"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "features", href: "#features" },
  { label: "how-it-works", href: "#how-it-works" },
  { label: "dashboard", href: "/dashboard" },
];

export function Nav() {
  const router = useRouter();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(920px,calc(100%-2rem))]">
      <div className="glass flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-indigo">
            <Terminal className="h-4 w-4 text-paper" strokeWidth={2.25} />
          </span>
          <span className="font-display font-semibold text-[15px] tracking-tight">
            InterviewOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 font-mono text-[13px] text-mist">
          {navItems.map((item) =>
            item.href.startsWith("#") ? (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 transition-colors hover:text-paper hover:bg-white/5"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 transition-colors hover:text-paper hover:bg-white/5"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <Button size="sm" variant="primary" onClick={() => router.push("/dashboard#start-interview")}>
          Start Free Interview
        </Button>
      </div>
    </header>
  );
}
