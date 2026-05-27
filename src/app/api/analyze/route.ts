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
    const tmpPath = join(tmpdir(), "salescoach-" + Date.now() + "." + ext);
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
      return NextResponse.json({ error: "Could not transcribe audio." }, { status: 400 });
    }

    const prompt = "You are an expert sales coach. Analyse this sales call transcript.\n\nTRANSCRIPT:\n" + transcript + "\n\nReturn ONLY valid JSON with this structure:\n{\"score\":<0-100>,\"grade\":\"Strong|Needs Work|Weak|Critical\",\"summary\":\"1-2 sentences\",\"lostMoment\":{\"timestamp\":\"approx time\",\"excerpt\":\"quote\",\"reason\":\"why deal died\"},\"betterScript\":\"rewritten 3-5 sentences\",\"topMistakes\":[\"m1\",\"m2\",\"m3\"],\"strengths\":[\"s1\",\"s2\"],\"transcript\":\"full text\"}";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
