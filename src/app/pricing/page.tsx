"use client";
import Link from "next/link";

const plans = [
  {
    name: "Starter", price: "Free", period: "", desc: "Perfect for trying SalesCoach AI",
    features: ["3 call analyses per month","Call score + lost moment","Better script suggestions","Practice mode (2 personas)"],
    cta: "Start free", href: "/analyze", highlight: false,
  },
  {
    name: "Pro", price: "₹2,999", period: "/month", desc: "For individual sales reps serious about closing",
    features: ["Unlimited call analyses","All 4 practice personas","Full transcript + timestamps","Shareable reports","Priority analysis speed","Email coaching tips weekly"],
    cta: "Start 7-day free trial", href: "/analyze", highlight: true,
  },
  {
    name: "Team", price: "₹9,999", period: "/month", desc: "For sales teams of 5–20 reps",
    features: ["Everything in Pro","Up to 20 team members","Team performance dashboard","Manager insights view","Dedicated onboarding call"],
    cta: "Contact us", href: "/analyze", highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        </Link>
        <Link href="/analyze"><button className="btn-primary" style={{ fontSize: 13, padding: "9px 22px" }}>Analyze a call →</button></Link>
      </nav>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Stop losing deals.<br /><span style={{ color: "var(--accent)" }}>Start closing them.</span>
          </h1>
          <p style={{ color: "var(--muted2)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            One lost deal costs more than a year of SalesCoach AI. Start free, upgrade when you see results.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? "rgba(0,229,160,0.04)" : "var(--surface)", border: "1px solid " + (plan.highlight ? "rgba(0,229,160,0.3)" : "var(--border)"), borderRadius: 20, padding: "32px 28px", position: "relative", boxShadow: plan.highlight ? "0 0 40px rgba(0,229,160,0.08)" : "none" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", padding: "4px 14px", borderRadius: 20 }}>MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--muted2)", letterSpacing: "0.06em", marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: 40, fontWeight: 800, color: plan.highlight ? "var(--accent)" : "var(--text)" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "var(--muted2)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>{plan.desc}</p>
              </div>
              <div style={{ marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href={plan.href}>
                <button className={plan.highlight ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "13px" }}>{plan.cta}</button>
              </Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 64 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, maxWidth: 700, margin: "0 auto" }}>
            {[
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no lock-in. Cancel in one click." },
              { q: "What audio formats work?", a: "MP3, WAV, M4A up to 25MB. Most call recordings work." },
              { q: "Is my data private?", a: "Your calls are processed and never stored or shared." },
              { q: "Do you offer refunds?", a: "Full refund within 7 days, no questions asked." },
            ].map((item) => (
              <div key={item.q} style={{ textAlign: "left", padding: "20px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{item.q}</div>
                <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>SalesCoach<span style={{ color: "var(--accent)" }}>AI</span></span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Built at OpenAI × Outskill AI Builders Hackathon · 2025</span>
      </footer>
    </main>
  );
}
