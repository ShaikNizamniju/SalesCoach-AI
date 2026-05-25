"use client";
import { useState } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

const PERSONAS = [
  { id: "skeptic", label: "The Skeptic", desc: "Doubts everything, wants proof", emoji: "🤨" },
  { id: "busy", label: "The Busy Exec", desc: "No time, needs instant value", emoji: "⏰" },
  { id: "price", label: "The Price Negotiator", desc: "Everything is too expensive", emoji: "💰" },
  { id: "competitor", label: "Happy with Competitor", desc: "Already has a solution", emoji: "🔒" },
];

export default function PracticePage() {
  const [persona, setPersona] = useState<string | null>(null);
  const [product, setProduct] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startSession = async () => {
    if (!persona || !product.trim()) return;
    setStarted(true);
    setLoading(true);
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, product, messages: [], action: "start" }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.message }]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMsg: Message = { role: "user", content: input };
    const updated = [...messages, newMsg];
    setMessages(updated); setInput(""); setLoading(true);
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, product, messages: updated, action: "reply" }),
    });
    const data = await res.json();
    setMessages([...updated, { role: "assistant", content: data.message }]);
    setLoading(false);
  };

  if (!started) return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <Link href="/analyze"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }}>Analyze a call</button></Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Practice mode</h1>
          <p style={{ color: "var(--muted2)", fontSize: 16 }}>Role-play against a tough prospect. Get real-time coaching after each response.</p>
        </div>

        <div className="fade-up-1" style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
            WHAT ARE YOU SELLING?
          </label>
          <input
            value={product} onChange={e => setProduct(e.target.value)}
            placeholder="e.g. SaaS CRM for small businesses · Insurance policy · EdTech course"
            style={{
              width: "100%", background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: 10, padding: "14px 16px", color: "var(--text)", fontSize: 14,
              outline: "none", transition: "border 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />
        </div>

        <div className="fade-up-2" style={{ marginBottom: 36 }}>
          <label style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
            CHOOSE YOUR PROSPECT
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PERSONAS.map(p => (
              <div key={p.id} onClick={() => setPersona(p.id)} style={{
                border: `1px solid ${persona === p.id ? "var(--accent)" : "var(--border)"}`,
                background: persona === p.id ? "rgba(0,229,160,0.06)" : "var(--surface)",
                borderRadius: 12, padding: "16px", cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted2)" }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary fade-up-3"
          style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px", opacity: (!persona || !product.trim()) ? 0.4 : 1 }}
          disabled={!persona || !product.trim()}
          onClick={startSession}>
          Start practice session →
        </button>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {PERSONAS.find(p => p.id === persona)?.emoji} {PERSONAS.find(p => p.id === persona)?.label}
          </span>
          <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => { setStarted(false); setMessages([]); }}>
            New session
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 700, width: "100%", margin: "0 auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 16, display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%", padding: "14px 18px", borderRadius: 14, fontSize: 14, lineHeight: 1.7,
              background: m.role === "user" ? "var(--accent)" : "var(--surface2)",
              color: m.role === "user" ? "#000" : "var(--text)",
              border: m.role === "assistant" ? "1px solid var(--border)" : "none",
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "14px 18px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "var(--muted)",
                animation: `pulse-glow 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        borderTop: "1px solid var(--border)", padding: "16px 24px",
        maxWidth: 700, width: "100%", margin: "0 auto", display: "flex", gap: 10,
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type your sales response..."
          style={{
            flex: 1, background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: 10, padding: "12px 16px", color: "var(--text)", fontSize: 14, outline: "none",
          }}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </main>
  );
}
