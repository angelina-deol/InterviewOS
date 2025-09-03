import type { Metadata } from "next";

// Self-hosted font packages (npm) rather than next/font/google, which needs
// a live fetch to fonts.googleapis.com at build time.
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewOS — Your AI interviewer knows your code",
  description:
    "Upload your resume, connect GitHub, and practice technical interviews with an AI that has actually read your projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-void text-paper">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
