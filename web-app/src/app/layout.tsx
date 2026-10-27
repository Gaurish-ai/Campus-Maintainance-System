import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Campus Maintenance Intelligence | Facilities Management MVP",
  description: "Enterprise web-based campus maintenance intelligence platform with NLP complaint structuring, duplicate clustering, AI priority triage, predictive maintenance, and cost-aware optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
