import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    if (!audio) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });

    const bytes = await audio.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = audio.name.split(".").pop() || "mp3";
    const tmpPath = join(tmpdir(), `salescoach-${Date.now()}.${ext}`);
    await writeFile(tmpPath, buffer);

    let transcript = "";
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(tmpPath) as unknown as File,
        model: "whisper-1",
        response_format: "text",
      });
      transcript = typeof transcription === "string" ? transcription : (transcription as { text: string }).text || "";
    } finally {
      await unlink(tmpPath).catch(() => {});
    }

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json({ error: "Could not transcribe audio. Please check the file quality." }, { status: 400 });
    }

    const analysisPrompt = `You are an expert sales coach. Analyse this sales call transcript and return a JSON object.

TRANSCRIPT:
${transcript}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "score": <integer 0-100>,
  "grade": "<Strong|Needs Work|Weak|Critical>",
  "summary": "<1-2 sentence overall summary of the call>",
  "lostMoment": {
    "timestamp": "<approximate time like 2:34 or around the 3-minute mark>",
    "excerpt": "<exact quote from transcript where prospect disengaged, max 2 sentences>",
    "reason": "<why this specific moment killed the deal, 1-2 sentences>"
  },
  "betterScript": "<rewritten version of what the rep should have said, 3-5 sentences>",
  "topMistakes": ["<mistake 1>", "<mistake 2>", "<mistake 3>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "transcript": "<full transcript text>"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    result.transcript = transcript;

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const msg = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
