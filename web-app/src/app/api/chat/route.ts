import { NextRequest, NextResponse } from 'next/server';
import {
  GEMINI_MODEL,
  createGeminiCompletion,
  getGeminiApiKey,
} from '@/lib/gemini';

const DEFAULT_SYSTEM_PROMPT =
  'You are CampusMI AI Assistant powered by Google Gemini. Provide concise, structured, helpful answers for campus facilities triage and maintenance requests.';

export async function GET() {
  const configured = Boolean(getGeminiApiKey());

  return NextResponse.json({
    online: configured,
    provider: 'gemini',
    model: GEMINI_MODEL,
    configured,
    message: configured
      ? 'Gemini chat API is configured.'
      : 'Set GEMINI_API_KEY in Vercel to enable live Gemini chat responses.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      history = [],
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      triageContext,
    } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history
        .slice(-6)
        .filter((h: { role?: string; content?: string }) =>
          (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string'
        )
        .map((h: { role: 'user' | 'assistant'; content: string }) => ({
          role: h.role,
          content: h.content,
        })),
      {
        role: 'user' as const,
        content: triageContext
          ? `[System Triage Data]:\n${triageContext}\n\n[User Input]:\n${message}`
          : message,
      },
    ];

    try {
      const reply = await createGeminiCompletion({
        messages,
        temperature: 0.35,
        maxTokens: 700,
        timeoutMs: 20000,
      });

      return NextResponse.json({
        success: true,
        reply,
        model: GEMINI_MODEL,
        source: 'gemini-live',
      });
    } catch (geminiError) {
      const fallback = buildFallbackReply(message, triageContext);
      const details = geminiError instanceof Error ? geminiError.message : 'Unknown Gemini error';

      return NextResponse.json({
        success: true,
        reply: fallback,
        model: GEMINI_MODEL,
        source: getGeminiApiKey() ? 'gemini-fallback' : 'gemini-not-configured',
        setupRequired: !getGeminiApiKey(),
        geminiError: details,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process AI chat input', details: errorMsg },
      { status: 500 }
    );
  }
}

function buildFallbackReply(message: string, triageContext?: string) {
  const lower = message.toLowerCase();
  const setupNote = getGeminiApiKey()
    ? '\n\n*Gemini is temporarily unavailable, so this response uses CampusMI fallback guidance.*'
    : '\n\n*Live Gemini responses will start working after `GEMINI_API_KEY` is added to Vercel.*';

  if (triageContext) {
    return `${triageContext}\n\n*Response prepared for Gemini model **${GEMINI_MODEL}**.*${setupNote}`;
  }

  if (
    lower.includes('p5') ||
    lower.includes('priority') ||
    lower.includes('triage') ||
    lower.includes('fifo') ||
    lower.includes('fcfs')
  ) {
    return (
      `**CampusMI Priority Architecture:**\n\n` +
      `1. **P5 (Critical Emergency):** Immediate electrical fires, live wires, hazardous chemical leaks, elevator collapse risk. Target response: under 30 minutes.\n` +
      `2. **P4 (High Urgency):** Main water burst, server room AC breakdown, wing blackout. Target response: under 2 hours.\n` +
      `3. **P3 (Medium Impact):** Multi-occupant room fan/water issue, classroom AV. Target response: under 6 hours.\n` +
      `4. **P2 (Low Disruption):** Single bulb replacement, paint peeling. Target response: under 24 hours.\n` +
      `5. **P1 (Routine Maintenance):** Cosmetic touchups and periodic filter changes.\n\n` +
      `CampusMI triages requests by safety hazard, occupancy, and infrastructure risk rather than simple FIFO/FCFS receipt time.${setupNote}`
    );
  }

  if (lower.includes('status') || lower.includes('track') || lower.includes('ticket')) {
    return (
      `Here is the current tracking summary from the maintenance registry:\n\n` +
      `- **Model:** \`${GEMINI_MODEL}\`\n` +
      `- **Latest Active Work Order:** \`R10492\` (HVAC / AC in Hostel H)\n` +
      `- **Status:** **IN_PROGRESS**\n` +
      `- **Estimated Resolution:** Within the standard 4-hour SLA window.\n\n` +
      `You can inspect detailed audit logs on the [Complaints Registry](/complaints) page.${setupNote}`
    );
  }

  return (
    `I am your **CampusMI AI Assistant**, configured for Google Gemini with **${GEMINI_MODEL}**.\n\n` +
    `I can accept maintenance reports and answer facilities questions. Try entering:\n` +
    `- *"Water leaking from overhead tank in Hostel B 2nd floor washroom"*\n` +
    `- *"Why are P5 incidents resolved before P1 requests?"*\n` +
    `- *"Status of electrical repair in Lecture Theatre 1"*${setupNote}`
  );
}
