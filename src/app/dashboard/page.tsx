"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type HistoryItem = {
  id: number; date: string; score: number; grade: string;
  summary: string; lostMoment: { timestamp: string; excerpt: string; reason: string };
  betterScript: string; topMistakes: string[]; strengths: string[]; transcript: string;
};

function gradeColor(score: number) {
  if (score >= 80) return "#00e5a0";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#fb923c";
  return "#ff4d4d";
}

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("salescoach_history") || "[]");
      setHistory(h);
    } catch {}
    setLoaded(true);
  }, []);

  const avg = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
  const best = history.length ? Math.max(...history.map(h => h.score)) : 0;
  const trend = history.length >= 2 ? history[0].score - history[history.length - 1].score : 0;

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <Link href="/analyze">
          <button className="btn-primary" style={{ fontSize: 13, padding: "9px 22px" }}>Analyze a call →</button>
        </Link>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>My Call History</h1>
          <p style={{ color: "var(--muted2)" }}>Track your progress across every analyzed call.</p>
        </div>

        {/* STATS ROW */}
        {history.length > 0 && (
          <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Calls Analyzed", value: history.length.toString() },
              { label: "Average Score", value: avg + "/100" },
              { label: "Best Score", value: best + "/100" },
              { label: "Trend", value: trend >= 0 ? "+" + trend + " pts" : trend + " pts", positive: trend >= 0 },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: "positive" in stat && !stat.positive ? "#ff4d4d" : "var(--accent)", letterSpacing: "-0.02em" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY LIST */}
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted2)" }}>Loading...</div>
        ) : history.length === 0 ? (
          <div className="card fade-up-2" style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No calls analyzed yet</h3>
            <p style={{ color: "var(--muted2)", marginBottom: 24 }}>Upload your first sales call to start tracking your progress.</p>
            <Link href="/analyze">
              <button className="btn-primary">Analyze your first call →</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {history.map((item, i) => (
              <div key={item.id} className="card fade-up-2" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid " + gradeColor(item.score), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: gradeColor(item.score), lineHeight: 1 }}>{item.score}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>/100</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "Syne, sans-serif", fontWeight: 700, color: gradeColor(item.score), marginTop: 4 }}>{item.grade}</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Call #{history.length - i}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 10 }}>{item.summary}</p>
                  <div style={{ fontSize: 12, background: "rgba(255,77,77,0.06)", border: "1px solid rgba(255,77,77,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ff6b6b" }}>
                    ⚠ Lost at {item.lostMoment.timestamp}
                  </div>
                </div>
                <Link href={"/results?data=" + encodeURIComponent(JSON.stringify(item))}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: "8px 16px", flexShrink: 0 }}>View report →</button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button className="btn-ghost" style={{ fontSize: 13 }}
              onClick={() => { if (confirm("Clear all history?")) { localStorage.removeItem("salescoach_history"); setHistory([]); } }}>
              Clear history
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
