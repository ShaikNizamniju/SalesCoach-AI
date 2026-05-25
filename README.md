# SalesCoach AI 🎯

> Know exactly why you lost the deal.

Built at the **OpenAI × Outskill AI Builders Hackathon** using Codex by OpenAI.

---

## What it does

Upload a sales call recording → AI pinpoints the exact moment you lost the deal → Get a rewritten script.

**Features:**
- 🎙️ Audio transcription via OpenAI Whisper
- 🧠 Call analysis via GPT-4o (score, lost moment, better script)
- 🥊 Practice mode — role-play against 4 tough prospect personas
- 📋 Shareable reports

---

## Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd salescoach-ai
npm install
```

### 2. Add your OpenAI API key
```bash
cp .env.example .env.local
# Edit .env.local and add your key
```
Get your key at: https://platform.openai.com/api-keys

### 3. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
# Add OPENAI_API_KEY in Vercel dashboard → Settings → Environment Variables
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Transcription | OpenAI Whisper |
| AI Analysis | GPT-4o |
| Styling | Tailwind + Custom CSS |
| Deployment | Vercel |
| Built with | Codex by OpenAI |

---

## Supported audio formats
MP3 · WAV · M4A · MP4 · Up to 25MB

---

Built by **Shaik Nizamuddin** · AI Product Manager
