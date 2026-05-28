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
      return NextResponse.json({ error: "Could not transcribe audio. Please check the file quality." }, { status: 400 });
    }
    const prompt =
