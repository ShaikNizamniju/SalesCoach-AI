import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    if (!audio) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });

    // Save to temp file
    const bytes = await audio.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = audio.name.split(".").pop() || "mp3";
    const tmpPath = join(tmpdir(), `salescoach-${Date.now()}.${ext}`);
    await writeFile(tmpPath, buffer);

    // Transcribe with Whisper
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

    // Analyse with GPT-4o
    const analysisPrompt = `You are an expert sales coach. Analyse this sales call transcript and return a JSON object.

TRANSCRIPT:
${transcript}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "score": <integer 0-100>,
  "grade": "<Strong|Needs Work|Weak|Critical>",
  "summary": "<1-2 sentence overall summary of the call>",
  "lostMoment": {
    "timestamp": "<approximate time like '2:34' or 'around the 3-minute mark' — estimate based on transcript position>",
    "excerpt": "<exact quote from transcript where prospect disengaged, max 2 sentences>",
    "reason": "<why this specific moment killed the deal, 1-2 sentences>"
  },
  "betterScript": "<rewritten version of what the rep should have said at that critical moment, 3-5 sentences, conversational tone>",
  "topMistakes": ["<mistake 1, concise>", "<mistake 2, concise>", "<mistake 3, concise>"],
  "strengths": ["<strength 1, concise>", "<strength 2, concise>"],
  "transcript": "<full transcript text>"
}

Score rubric:
- 80-100: Strong call, minor improvements needed
- 60-79: Decent but key mistakes present
- 40-59: Several fundamental errors
- 0-39: Critical issues throughout

Be specific and actionable. Reference actual quotes from the transcript.`;

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

export const config = { api: { bodyParser: false } };
