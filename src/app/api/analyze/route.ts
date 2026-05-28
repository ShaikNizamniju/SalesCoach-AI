import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const { transcript } = await req.json();
    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json({ error: "Transcript too short." }, { status: 400 });
    }
    const prompt = "You are an expert sales coach. Analyse this sales call transcript.\n\nTRANSCRIPT:\n" + transcript + "\n\nReturn ONLY valid JSON:\n{\"score\":<0-100>,\"grade\":\"Strong|Needs Work|Weak|Critical\",\"summary\":\"1-2 sentences\",\"lostMoment\":{\"timestamp\":\"approx moment\",\"excerpt\":\"exact quote\",\"reason\":\"why deal died\"},\"betterScript\":\"rewritten 3-5 sentences\",\"topMistakes\":[\"m1\",\"m2\",\"m3\"],\"strengths\":[\"s1\",\"s2\"],\"transcript\":\"full text\"}";
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content || "";
const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("AI returned invalid response. Please try again.");
const result = JSON.parse(jsonMatch[0]);
    result.transcript = transcript;
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
