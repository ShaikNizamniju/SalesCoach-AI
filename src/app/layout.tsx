import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesCoach AI — Know exactly why you lost the deal",
  description: "Upload your sales call recording. AI pinpoints the exact moment you lost the deal and rewrites your script.",
  keywords: "sales coaching, AI sales coach, sales call analysis, improve close rate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
