import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProgressPanel } from "@/components/dashboard/ProgressPanel";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 md:px-6">
      <div className="glow-violet absolute inset-x-0 top-0 h-[400px] -z-10" />

      {/* IDE-style tab bar */}
      <div className="mx-auto mb-4 flex max-w-[1400px] items-center gap-1 px-1">
        <div className="glass flex items-center gap-2 rounded-t-lg rounded-b-none border-b-0 px-4 py-2 font-mono text-[12px] text-paper/90">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          dashboard.tsx
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 md:flex-row">
        <Sidebar />
        <ProgressPanel />
      </div>
    </main>
  );
}
