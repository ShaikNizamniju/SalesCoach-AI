"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type LostMoment = { timestamp: string; excerpt: string; reason: string };
type AnalysisResult = {
  score: number; grade: string; transcript: string;
  lostMoment: LostMoment; betterScript: string;
  topMistakes: string[]; strengths: string[]; summary: string;
};

function gradeColor(score: number) {
  if (score >= 80) return "#00e5a0";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#fb923c";
  return "#ff4d4d";
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("salescoach_result");
      if (stored) setResult(JSON.parse(stored));
    } catch {}
  }, []);

  if (!result) return (
    <div style={{ padding: "80px 40px", textAlign: "center" }}>
      <p style={{ color: "var(--muted2)" }}>No results found. <Link href="/analyze" style={{ color: "var(--accent)" }}>Analyze a call</Link></p>
    </div>
  );

  const color = gradeColor(result.score);

  const shareToLinkedIn = () => {
    const text = "I just analyzed my sales call with SalesCoach AI 🎯\n\nCall Score: " + result.score + "/100\n\nWhere I lost the deal:\n\"" + result.lostMoment.excerpt + "\"\n\nTop mistake: " + result.topMistakes[0] + "\n\nBuilt with OpenAI — try it free: https://sales-coach-ai-pi.vercel.app\n\n#SalesCoachAI #OpenAIHackathon #BuildInPublic";
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://sales-coach-ai-pi.vercel.app") + "&summary=" + encodeURIComponent(text), "_blank");
  };

  const copyReport = () => {
    const text = "SalesCoach AI Report\nScore: " + result.score + "/100\n\nLost moment: " + result.lostMoment.reason + "\n\nBetter script:\n" + result.betterScript;
    navigator.clipboard?.writeText(text);
    alert("Report copied!");
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>My History</button></Link>
          <Link href="/analyze"><button className="btn-primary" style={{ fontSize: 13, padding: "9px 22px" }}>Analyze another →</button></Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", marginBottom: 12 }}>CALL ANALYSIS REPORT</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Your results are in</h1>
          <p style={{ color: "var(--muted2)" }}>{result.summary}</p>
        </div>

        <div className="card score-ring fade-up-1" style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24, borderColor: color + "30", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", border: "4px solid " + color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px " + color + "25" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>/100</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color, marginTop: 8 }}>{result.grade}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Call Score: {result.score}/100</div>
            <div style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7 }}>
              {result.score >= 70 ? "Solid performance with clear areas to optimize." : result.score >= 50 ? "Several key moments cost you this deal." : "This call had fundamental issues. The coaching below will help significantly."}
            </div>
          </div>
        </div>

        <div className="fade-up-2" style={{ background: "rgba(255,77,77,0.05)", border: "1px solid rgba(255,77,77,0.2)", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,77,77,0.15)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#ff6b6b" }}>⚠ DEAL LOST HERE</div>
            {result.lostMoment.timestamp && <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{result.lostMoment.timestamp}</div>}
          </div>
          <div style={{ fontStyle: "italic", color: "var(--muted2)", fontSize: 14, borderLeft: "3px solid rgba(255,77,77,0.4)", paddingLeft: 16, lineHeight: 1.7, marginBottom: 16 }}>"{result.lostMoment.excerpt}"</div>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}><span style={{ fontWeight: 500, color: "#ff6b6b" }}>Why this killed the deal: </span>{result.lostMoment.reason}</div>
        </div>

        <div className="fade-up-3" style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "rgba(0,229,160,0.12)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)" }}>✓ BETTER SCRIPT</div>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Say this instead at the critical moment:</p>
          <div style={{ fontSize: 14, lineHeight: 1.8, background: "var(--surface)", borderRadius: 10, padding: "18px 20px", borderLeft: "3px solid var(--accent)" }}>{result.betterScript}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div className="card fade-up-3">
            <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#ff6b6b", letterSpacing: "0.06em", marginBottom: 14 }}>TOP MISTAKES</div>
            {result.topMistakes.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}><span style={{ color: "#ff6b6b", flexShrink: 0 }}>{i + 1}.</span>{m}</div>
            ))}
          </div>
          <div className="card fade-up-4">
            <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", marginBottom: 14 }}>WHAT WORKED</div>
            {result.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}><span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>{s}</div>
            ))}
          </div>
        </div>

        {result.transcript && (
          <details className="card fade-up-4" style={{ marginBottom: 32, cursor: "pointer" }}>
            <summary style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              View full transcript <span style={{ color: "var(--muted)", fontSize: 12 }}>Click to expand ↓</span>
            </summary>
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted2)", lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto" }}>{result.transcript}</div>
          </details>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/analyze"><button className="btn-primary">Analyze another call →</button></Link>
          <button className="btn-ghost" onClick={shareToLinkedIn}>Share on LinkedIn 🔗</button>
          <button className="btn-ghost" onClick={copyReport}>Copy report</button>
          <Link href="/practice"><button className="btn-ghost">Practice with AI</button></Link>
        </div>
      </div>
    </main>
  );
}