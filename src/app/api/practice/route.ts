import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const PERSONA_PROMPTS: Record<string, string> = {
  skeptic: `You are a skeptical B2B buyer in a sales call. You doubt every claim, ask for proof and data, and are hard to impress. 
    You ask tough questions like "How do I know this actually works?" and "Can you prove that ROI?". 
    Be realistic, not rude. After 3-4 exchanges, you can slightly warm up if the rep handles your objections well.
    After the rep's response, also give a brief [COACH NOTE: ...] on what they did well or badly.`,
  busy: `You are a senior executive in a sales call who is extremely time-pressed. You constantly look for reasons to end the call.
    You say things like "I have 5 minutes, get to the point" and "I don't need the backstory, what's the value?".
    Reward brevity and clarity. After the rep's response, give a brief [COACH NOTE: ...] on what they did well or badly.`,
  price: `You are a procurement-minded buyer who challenges every price. You compare to competitors, ask for discounts, 
    and question ROI constantly. You say things like "Your competitor does this for half the price" and "I need to justify this to my CFO".
    After the rep's response, give a brief [COACH NOTE: ...] on what they did well or badly.`,
  competitor: `You are a buyer who is already happy with a competing solution. You are not actively looking to switch. 
    You say things like "We're already using [Competitor] and it works fine" and "Why would I disrupt a working system?".
    Warm up slowly if the rep gives compelling differentiation. After the rep's response, give a brief [COACH NOTE: ...].`,
};

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const { persona, product, messages, action } = await req.json();
    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.skeptic;

    const systemPrompt = `${personaPrompt}
    
The rep is selling: ${product}
Keep responses concise (2-4 sentences as the prospect + 1-2 sentence coach note).
Format your coach note as: [COACH NOTE: ...]`;

    if (action === "start") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Start the call. The rep just called you and introduced themselves. Give your opening response as this prospect." },
        ],
        temperature: 0.8,
        max_tokens: 300,
      });
      return NextResponse.json({ message: completion.choices[0]?.message?.content || "Hello?" });
    }

    const chatMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
      temperature: 0.8,
      max_tokens: 400,
    });

    return NextResponse.json({ message: completion.choices[0]?.message?.content || "..." });
  } catch (error: unknown) {
    console.error("Practice error:", error);
    return NextResponse.json({ error: "Practice session failed" }, { status: 500 });
  }
}
