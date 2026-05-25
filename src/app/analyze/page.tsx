"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Stage = "idle" | "uploading" | "transcribing" | "analysing" | "done" | "error";

const stageLabels: Record<Stage, string> = {
  idle: "",
  uploading: "Uploading your call...",
  transcribing: "Transcribing with Whisper AI...",
  analysing: "Analysing conversation patterns...",
  done: "Analysis complete",
  error: "Something went wrong",
};

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (f: File) => {
    const valid = ["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/m4a","audio/mp4","audio/x-m4a","video/mp4"];
    if (!valid.some(t => f.type === t) && !f.name.match(/\.(mp3|wav|m4a|mp4)$/i)) {
      setError("Please upload an MP3, WAV, or M4A file."); return;
    }
    if (f.size > 25 * 1024 * 1024) { setError("File too large. Max 25MB."); return; }
    setFile(f); setError("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStage("uploading");
    const form = new FormData();
    form.append("audio", file);
    try {
      setStage("transcribing");
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }
      setStage("analysing");
      const data = await res.json();
      setResult(data);
      setStage("done");
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (e: unknown) {
      setStage("error");
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    }
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>
            SalesCoach<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </Link>
        <Link href="/practice">
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }}>Practice mode</button>
        </Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Analyze your call
          </h1>
          <p style={{ color: "var(--muted2)", fontSize: 16 }}>
            Upload a recording and get your breakdown in 30 seconds.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        {stage === "idle" || stage === "error" ? (
          <div
            className="fade-up-1"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: `2px dashed ${drag ? "var(--accent)" : file ? "rgba(0,229,160,0.4)" : "var(--border2)"}`,
              borderRadius: 16, padding: "60px 32px", textAlign: "center", cursor: "pointer",
              background: drag ? "rgba(0,229,160,0.04)" : file ? "rgba(0,229,160,0.03)" : "var(--surface)",
              transition: "all 0.2s",
            }}
          >
            <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.mp4,audio/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  Drop your call recording here
                </div>
                <div style={{ fontSize: 14, color: "var(--muted2)" }}>
                  or <span style={{ color: "var(--accent)" }}>click to browse</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
                  MP3 · WAV · M4A · up to 25MB
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* LOADING */}
        {(stage === "uploading" || stage === "transcribing" || stage === "analysing") && (
          <div style={{
            border: "1px solid var(--border2)", borderRadius: 16, padding: "60px 32px",
            textAlign: "center", background: "var(--surface)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "3px solid var(--border2)", borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite", margin: "0 auto 24px",
            }} />
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {stageLabels[stage]}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {stage === "transcribing" && "This usually takes 10–20 seconds"}
              {stage === "analysing" && "Reading your conversation patterns..."}
              {stage === "uploading" && "Sending your file securely..."}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{
            background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)",
            borderRadius: 10, padding: "14px 18px", marginTop: 16,
            fontSize: 14, color: "#ff6b6b",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ANALYSE BUTTON */}
        {(stage === "idle" || stage === "error") && file && (
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 15, padding: "14px" }}
              onClick={handleAnalyze}>
              Analyze this call →
            </button>
            <button className="btn-ghost" onClick={() => { setFile(null); setError(""); }}>Clear</button>
          </div>
        )}

        {!file && stage === "idle" && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button className="btn-primary" style={{ opacity: 0.3, cursor: "not-allowed" }} disabled>
              Analyze this call →
            </button>
          </div>
        )}

        {/* TIPS */}
        <div style={{ marginTop: 40, padding: "20px 24px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", marginBottom: 12 }}>
            TIPS FOR BEST RESULTS
          </div>
          {[
            "Use calls where you can hear both speakers clearly",
            "Works best with calls 3–30 minutes long",
            "Include the discovery, pitch, and objection parts if possible",
          ].map(t => (
            <div key={t} style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", marginTop: 2 }}>↗</span>{t}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

type AnalysisResult = {
  score: number;
  grade: string;
  transcript: string;
  lostMoment: { timestamp: string; excerpt: string; reason: string };
  betterScript: string;
  topMistakes: string[];
  strengths: string[];
  summary: string;
};
