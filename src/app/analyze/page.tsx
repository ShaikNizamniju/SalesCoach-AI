"use client";
import { useState, useRef } from "react";
import Link from "next/link";

type Stage = "idle" | "uploading" | "transcribing" | "analysing" | "done" | "error";
type Tab = "audio" | "text";
type AnalysisResult = {
  score: number; grade: string; transcript: string;
  lostMoment: { timestamp: string; excerpt: string; reason: string };
  betterScript: string; topMistakes: string[]; strengths: string[]; summary: string;
};

function gradeColor(s: number) {
  if (s >= 80) return "#00e5a0";
  if (s >= 60) return "#f59e0b";
  if (s >= 40) return "#fb923c";
  return "#ff4d4d";
}

export default function AnalyzePage() {
  const [tab, setTab] = useState<Tab>("audio");
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 25 * 1024 * 1024) { setError("File too large. Max 25MB."); return; }
    setFile(f); setError("");
  };

  const handleAnalyze = async () => {
    if (tab === "audio" && !file) return;
    if (tab === "text" && transcript.trim().length < 50) { setError("Please paste at least 50 characters."); return; }
    setStage("uploading"); setError(""); setResult(null);
    try {
      let res;
      if (tab === "audio") {
        setStage("transcribing");
        const form = new FormData();
        form.append("audio", file!);
        res = await fetch("/api/analyze", { method: "POST", body: form });
      } else {
        setStage("analysing");
        res = await fetch("/api/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }
      setStage("analysing");
      const data = await res.json();
      try {
        const history = JSON.parse(localStorage.getItem("salescoach_history") || "[]");
        history.unshift({ ...data, date: new Date().toISOString(), id: Date.now() });
        localStorage.setItem("salescoach_history", JSON.stringify(history.slice(0, 20)));
      } catch {}
      setResult(data);
      setStage("done");
    } catch (e: unknown) {
      setStage("error");
      const msg = e instanceof Error ? e.message : "Analysis failed";
      setError(msg.includes("fetch") ? "Audio upload failed on mobile. Please use the Paste Transcript tab!" : msg);
    }
  };

  const isLoading = stage === "uploading" || stage === "transcribing" || stage === "analysing";

  const shareToLinkedIn = () => {
    if (!result) return;
    const text = "Just analyzed a sales call with SalesCoach AI 🎯\nScore: " + result.score + "/100\nLost moment: \"" + result.lostMoment.excerpt + "\"\nTry it free: https://sales-coach-ai-pi.vercel.app\n#SalesCoachAI #OpenAIHackathon";
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=https://sales-coach-ai-pi.vercel.app&summary=" + encodeURIComponent(text), "_blank");
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 10 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard"><button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>History</button></Link>
          <Link href="/practice"><button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>Practice</button></Link>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
        {!result && (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Analyze your call</h1>
              <p style={{ color: "var(--muted2)", fontSize: 15 }}>Upload a recording or paste a transcript — get your breakdown in 30 seconds.</p>
            </div>

            <div style={{ display: "flex", gap: 4, background: "var(--surface)", borderRadius: 10, padding: 4, marginBottom: 20, border: "1px solid var(--border)" }}>
              {(["audio", "text"] as Tab[]).map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#000" : "var(--muted2)", transition: "all 0.2s" }}>
                  {t === "audio" ? "🎙️ Upload Audio" : "📝 Paste Transcript"}
                </button>
              ))}
            </div>

            {tab === "audio" && !isLoading && (
              <div onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                style={{ border: "2px dashed " + (drag ? "var(--accent)" : file ? "rgba(0,229,160,0.4)" : "var(--border2)"), borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: "var(--surface)", transition: "all 0.2s", marginBottom: 16 }}>
                <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.mp4,audio/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {file ? (
                  <><div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div><div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)" }}>{file.name}</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{(file.size/1024/1024).toFixed(1)} MB · Click to change</div></>
                ) : (
                  <><div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Drop your call recording here</div><div style={{ fontSize: 13, color: "var(--muted2)" }}>or <span style={{ color: "var(--accent)" }}>click to browse</span></div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>MP3 · WAV · M4A · On mobile? Use Paste Transcript ↑</div></>
                )}
              </div>
            )}

            {tab === "text" && !isLoading && (
              <div style={{ marginBottom: 16 }}>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
                  placeholder={"Paste your sales call transcript here...\n\nRep: Hi, is this a good time?\nProspect: Sure, what's this about?"}
                  style={{ width: "100%", minHeight: 240, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 12, padding: "16px", color: "var(--text)", fontSize: 14, lineHeight: 1.7, outline: "none", resize: "vertical", fontFamily: "DM Sans, sans-serif" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border2)"}
                />
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{transcript.length} characters · Min 50</div>
              </div>
            )}

            {isLoading && (
              <div style={{ border: "1px solid var(--border2)", borderRadius: 16, padding: "48px 24px", textAlign: "center", background: "var(--surface)", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border2)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  {stage === "transcribing" ? "Transcribing with Whisper..." : "Analysing conversation..."}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>This takes 15–30 seconds</div>
              </div>
            )}

            {error && <div style={{ background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 14, color: "#ff6b6b" }}>⚠️ {error}</div>}

            {!isLoading && (
              <button className="btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px", opacity: (tab === "audio" && !file) || (tab === "text" && transcript.length < 50) ? 0.4 : 1 }}
                disabled={(tab === "audio" && !file) || (tab === "text" && transcript.length < 50)}
                onClick={handleAnalyze}>
                Analyze this call →
              </button>
            )}
          </>
        )}

        {result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Your results are in</h1>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setResult(null); setFile(null); setTranscript(""); setStage("idle"); }}>
                ← Analyze another
              </button>
            </div>

            <p style={{ color: "var(--muted2)", marginBottom: 24 }}>{result.summary}</p>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, borderColor: gradeColor(result.score) + "30", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", border: "4px solid " + gradeColor(result.score), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: gradeColor(result.score), lineHeight: 1 }}>{result.score}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>/100</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: gradeColor(result.score), marginTop: 6 }}>{result.grade}</div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Call Score: {result.score}/100</div>
                <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6 }}>{result.score >= 70 ? "Solid performance. Focus on the moments below." : result.score >= 50 ? "Several key moments cost you this deal." : "Fundamental issues found. The coaching below will help significantly."}</div>
              </div>
            </div>

            <div style={{ background: "rgba(255,77,77,0.05)", border: "1px solid rgba(255,77,77,0.2)", borderRadius: 14, padding: "22px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: "rgba(255,77,77,0.15)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#ff6b6b" }}>⚠ DEAL LOST HERE</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{result.lostMoment.timestamp}</span>
              </div>
              <div style={{ fontStyle: "italic", color: "var(--muted2)", fontSize: 13, borderLeft: "3px solid rgba(255,77,77,0.4)", paddingLeft: 14, lineHeight: 1.7, marginBottom: 12 }}>"{result.lostMoment.excerpt}"</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}><span style={{ fontWeight: 500, color: "#ff6b6b" }}>Why: </span>{result.lostMoment.reason}</div>
            </div>

            <div style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 14, padding: "22px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>✓ BETTER SCRIPT</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, background: "var(--surface)", borderRadius: 8, padding: "14px 16px", borderLeft: "3px solid var(--accent)" }}>{result.betterScript}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="card">
                <div style={{ fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#ff6b6b", marginBottom: 12 }}>TOP MISTAKES</div>
                {result.topMistakes.map((m, i) => <div key={i} style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 8, display: "flex", gap: 6 }}><span style={{ color: "#ff6b6b" }}>{i+1}.</span>{m}</div>)}
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>WHAT WORKED</div>
                {result.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 8, display: "flex", gap: 6 }}><span style={{ color: "var(--accent)" }}>✓</span>{s}</div>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => { setResult(null); setFile(null); setTranscript(""); setStage("idle"); }}>Analyze another →</button>
              <button className="btn-ghost" onClick={shareToLinkedIn}>Share on LinkedIn 🔗</button>
              <Link href="/practice"><button className="btn-ghost">Practice mode</button></Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}