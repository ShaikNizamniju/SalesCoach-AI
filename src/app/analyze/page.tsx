"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Stage = "idle" | "uploading" | "transcribing" | "analysing" | "done" | "error";
type Tab = "audio" | "text";

const stageLabels: Record<Stage, string> = {
  idle: "", uploading: "Uploading your call...",
  transcribing: "Transcribing with Whisper AI...",
  analysing: "Analysing conversation patterns...",
  done: "Analysis complete", error: "Something went wrong",
};

export default function AnalyzePage() {
  const [tab, setTab] = useState<Tab>(
  typeof window !== "undefined" && window.innerWidth < 768 ? "text" : "audio"
);
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (f: File) => {
    if (f.size > 25 * 1024 * 1024) { setError("File too large. Max 25MB."); return; }
    setFile(f); setError("");
  };

  const handleAnalyze = async () => {
    if (tab === "audio" && !file) return;
    if (tab === "text" && transcript.trim().length < 50) {
      setError("Please paste a transcript of at least 50 characters."); return;
    }
    setStage("uploading"); setError("");
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
      setStage("done");

      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("salescoach_history") || "[]");
        history.unshift({ ...data, date: new Date().toISOString(), id: Date.now() });
        localStorage.setItem("salescoach_history", JSON.stringify(history.slice(0, 20)));
      } catch {}

      router.push("/results?data=" + encodeURIComponent(JSON.stringify(data)));
    } catch (e: unknown) {
      setStage("error");
      setError(e instanceof Error && e.message.includes("fetch") 
  ? "Audio upload failed on mobile. Please use the 'Paste Transcript' tab instead — it works perfectly on mobile!" 
  : e instanceof Error ? e.message : "Analysis failed. Please try again.");
    }
  };

  const isLoading = stage === "uploading" || stage === "transcribing" || stage === "analysing";

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }}>My History</button></Link>
          <Link href="/practice"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }}>Practice mode</button></Link>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Analyze your call</h1>
          <p style={{ color: "var(--muted2)", fontSize: 16 }}>Upload a recording or paste a transcript — get your breakdown in 30 seconds.</p>
        </div>

        {/* TABS */}
        <div className="fade-up-1" style={{ display: "flex", gap: 4, background: "var(--surface)", borderRadius: 10, padding: 4, marginBottom: 24, border: "1px solid var(--border)" }}>
          {(["audio", "text"] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13,
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#000" : "var(--muted2)",
                transition: "all 0.2s",
              }}>
              {t === "audio" ? "🎙️ Upload Audio" : "📝 Paste Transcript"}
            </button>
          ))}
        </div>

        {/* AUDIO UPLOAD */}
        {tab === "audio" && !isLoading && (
          <div className="fade-up-1"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: "2px dashed " + (drag ? "var(--accent)" : file ? "rgba(0,229,160,0.4)" : "var(--border2)"),
              borderRadius: 16, padding: "60px 32px", textAlign: "center", cursor: "pointer",
              background: drag ? "rgba(0,229,160,0.04)" : "var(--surface)", transition: "all 0.2s",
            }}>
            <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.mp4,audio/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>{file.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Drop your call recording here</div>
                <div style={{ fontSize: 14, color: "var(--muted2)" }}>or <span style={{ color: "var(--accent)" }}>click to browse</span></div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>MP3 · WAV · M4A · up to 4MB · On mobile? Use Paste Transcript ↑</div>
              </>
            )}
          </div>
        )}

        {/* TEXT INPUT */}
        {tab === "text" && !isLoading && (
          <div className="fade-up-1">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={"Paste your sales call transcript here...\n\nExample:\nRep: Hi, is this a good time to talk?\nProspect: Sure, what's this about?\nRep: I wanted to share how our product..."}
              style={{
                width: "100%", minHeight: 280, background: "var(--surface)",
                border: "1px solid var(--border2)", borderRadius: 12,
                padding: "18px", color: "var(--text)", fontSize: 14,
                lineHeight: 1.7, outline: "none", resize: "vertical",
                fontFamily: "DM Sans, sans-serif", transition: "border 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border2)"}
            />
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              {transcript.length} characters · Minimum 50 required
            </div>
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div style={{ border: "1px solid var(--border2)", borderRadius: 16, padding: "60px 32px", textAlign: "center", background: "var(--surface)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid var(--border2)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 24px" }} />
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{stageLabels[stage]}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {stage === "transcribing" && "This usually takes 10–20 seconds"}
              {stage === "analysing" && "Reading your conversation patterns..."}
              {stage === "uploading" && "Sending your file securely..."}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)", borderRadius: 10, padding: "14px 18px", marginTop: 16, fontSize: 14, color: "#ff6b6b" }}>
            ⚠️ {error}
          </div>
        )}

        {!isLoading && (
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button className="btn-primary"
              style={{ flex: 1, justifyContent: "center", fontSize: 15, padding: "14px", opacity: (tab === "audio" && !file) || (tab === "text" && transcript.length < 50) ? 0.4 : 1 }}
              disabled={(tab === "audio" && !file) || (tab === "text" && transcript.length < 50)}
              onClick={handleAnalyze}>
              Analyze this call →
            </button>
            {(file || transcript) && (
              <button className="btn-ghost" onClick={() => { setFile(null); setTranscript(""); setError(""); }}>Clear</button>
            )}
          </div>
        )}

        <div style={{ marginTop: 40, padding: "20px 24px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", marginBottom: 12 }}>TIPS FOR BEST RESULTS</div>
          {["Use calls where you can hear both speakers clearly", "Works best with calls 3–30 minutes long", "For transcripts: include Rep and Prospect labels if possible"].map(t => (
            <div key={t} style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 6, display: "flex", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>↗</span>{t}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
