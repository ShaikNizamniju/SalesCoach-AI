"use client";
import Link from "next/link";
import { useState } from "react";

const stats = [
  { value: "73%", label: "of deals are lost in the first 3 minutes" },
  { value: "94%", label: "of reps get zero feedback on lost calls" },
  { value: "3.2×", label: "higher close rate with structured coaching" },
];

const steps = [
  { num: "01", title: "Upload your call", desc: "Drop any sales call recording — MP3, WAV, M4A, up to 25MB." },
  { num: "02", title: "AI analyses the conversation", desc: "Whisper transcribes. GPT-4o reads the entire call and finds the exact turning point." },
  { num: "03", title: "Get your breakdown", desc: "Call score, lost moment with timestamp, and a rewritten script that keeps the prospect engaged." },
];

export default function Landing() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(10,10,11,0.85)",
        backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>
            SalesCoach<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/analyze">
            <button className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>
              Analyze a call →
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 40px 80px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div className="fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
          borderRadius: 20, padding: "5px 14px", marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "block" }} />
          <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "Syne, sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}>
            BUILT WITH OPENAI CODEX
          </span>
        </div>

        <h1 className="fade-up-1" style={{
          fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.05,
          fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24,
        }}>
          Know exactly why<br />
          <span style={{ color: "var(--accent)" }}>you lost the deal.</span>
        </h1>

        <p className="fade-up-2" style={{
          fontSize: 18, color: "var(--muted2)", maxWidth: 560, margin: "0 auto 48px",
          lineHeight: 1.7, fontWeight: 300,
        }}>
          Upload your sales call. AI pinpoints the exact moment the prospect checked out
          — and rewrites your script with a better approach.
        </p>

        <div className="fade-up-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/analyze">
            <button className="btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>
              Analyze your first call — free
            </button>
          </Link>
          <Link href="/practice">
            <button className="btn-ghost" style={{ fontSize: 15, padding: "14px 32px" }}>
              Practice mode
            </button>
          </Link>
        </div>

        <p className="fade-up-4" style={{ fontSize: 12, color: "var(--muted)", marginTop: 20 }}>
          No account needed · Results in 30 seconds · Supports MP3, WAV, M4A
        </p>
      </section>

      {/* STATS */}
      <section style={{
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "48px 40px", background: "var(--surface)",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 40, maxWidth: 900, margin: "0 auto", textAlign: "center",
        }}>
          {stats.map((s) => (
            <div key={s.value}>
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 52, fontWeight: 800,
                color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1,
              }}>{s.value}</div>
              <div style={{ fontSize: 14, color: "var(--muted2)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="tag" style={{ background: "rgba(0,229,160,0.08)", color: "var(--accent)", display: "inline-block", marginBottom: 16 }}>
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            From recording to insight<br />in under 30 seconds
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {steps.map((step) => (
            <div key={step.num} className="card" style={{ position: "relative" }}>
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700,
                color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 16,
              }}>{step.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section style={{ padding: "0 40px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div className="card" style={{ background: "var(--surface2)", borderColor: "var(--border2)", padding: "40px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 32 }}>
            What you get in every report
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 28 }}>
            {[
              { icon: "🎯", title: "Call Score", desc: "0–100 rating across engagement, objection handling, and closing technique" },
              { icon: "⚠️", title: "Lost Moment", desc: "Exact timestamp and transcript excerpt where the deal turned cold" },
              { icon: "✍️", title: "Better Script", desc: "Rewritten version of your critical moments that keeps prospects engaged" },
              { icon: "📋", title: "Key Mistakes", desc: "Top 3 patterns across your call that cost you the deal" },
            ].map((item) => (
              <div key={item.title}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section style={{
        padding: "80px 40px", textAlign: "center",
        borderTop: "1px solid var(--border)",
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Stop losing deals<br />you should have won.
        </h2>
        <p style={{ color: "var(--muted2)", fontSize: 16, marginBottom: 40 }}>
          First analysis is free. No sign-up required.
        </p>
        <Link href="/analyze">
          <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px", marginBottom: 32 }}>
            Upload your call now →
          </button>
        </Link>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            Get weekly sales coaching tips — free
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                flex: 1, background: "var(--surface)", border: "1px solid var(--border2)",
                borderRadius: 8, padding: "12px 16px", color: "var(--text)",
                fontSize: 14, outline: "none",
              }}
            />
            <button
              className="btn-primary"
              style={{ padding: "12px 20px", flexShrink: 0 }}
              <button className="btn-ghost" onClick={() => {
            const shareUrl = window.location.href;
            if (navigator.share) {
              navigator.share({ title: `My SalesCoach AI Report — ${result!.score}/100`, url: shareUrl });
            } else {
              navigator.clipboard?.writeText(shareUrl);
              alert("Link copied! Share it anywhere.");
            }
          }}>Share report 🔗</button>
          <button className="btn-ghost" onClick={() => {
            const text = `My SalesCoach AI Report\nScore: ${result!.score}/100\n\nLost moment: ${result!.lostMoment.reason}\n\nBetter script:\n${result!.betterScript}`;
            navigator.clipboard?.writeText(text);
            alert("Report copied to clipboard!");
          }}>Copy report</button>
            </button>
          </div>
        </div>
      </section>
          <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            Upload your call now →
          </button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>
          SalesCoach<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Built at OpenAI × Outskill AI Builders Hackathon · 2025
        </span>
      </footer>
    </main>
  );
}
