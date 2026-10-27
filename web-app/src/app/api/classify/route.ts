import { NextRequest, NextResponse } from 'next/server';
import {
  GEMINI_MODEL,
  createGeminiCompletion,
} from '@/lib/gemini';

const CLASSIFY_SYSTEM_PROMPT = `You are a campus facility maintenance triage assistant.
Given a user complaint, evaluate if there is ENOUGH INFORMATION to dispatch a technician:

REQUIREMENTS FOR COMPLETENESS:
1. Clear problem description.
2. Specific building or hostel (e.g. Hostel A-T, Block A-G, LT-101 to LT-304, CSED, Library).
3. Specific room, lab, or area (e.g. Room 152, 2nd floor washroom, corridor, etc.).

If either the building/hostel OR the room/area is missing, set "is_complete": false and provide a polite "clarification_question" asking specifically for the missing details.
If both building/hostel AND room/area are present, set "is_complete": true, "missing_info": null, "clarification_question": null.

Respond with ONLY a valid JSON object matching this schema:
{
  "title": "<short issue title, max 6 words, title case>",
  "category": "<one of: Electricity | Plumbing | HVAC/AC | IT/Network | Carpentry | Masonry | Housekeeping | Fire System | Welder | General Facilities>",
  "location": "<detected building or hostel, or null if missing>",
  "room": "<detected room or area, or null if missing>",
  "is_complete": true or false,
  "missing_info": "<description of missing info, e.g. 'hostel and room number', or null>",
  "clarification_question": "<friendly question to ask the user, or null>"
}

Examples:
- "register a wifi issue low speed in A hostel room 152"
  -> {"title": "WiFi Slow Speed", "category": "IT/Network", "location": "Hostel A", "room": "Room 152", "is_complete": true, "missing_info": null, "clarification_question": null}
- "wifi low speed"
  -> {"title": "WiFi Slow Speed", "category": "IT/Network", "location": null, "room": null, "is_complete": false, "missing_info": "hostel/building name and room number", "clarification_question": "I can help register this WiFi issue, but could you please tell me which hostel/building and room number you are in?"}
- "water leaking from tap in hostel B"
  -> {"title": "Tap Leakage", "category": "Plumbing", "location": "Hostel B", "room": null, "is_complete": false, "missing_info": "room number or floor washroom", "clarification_question": "Which room number or washroom in Hostel B has the leaking tap?"}`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    try {
      const raw = await createGeminiCompletion({
        messages: [
          { role: 'system', content: CLASSIFY_SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.1,
        maxTokens: 300,
        timeoutMs: 20000,
      });

      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        try {
          const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
          if (parsed.title && parsed.category) {
            return NextResponse.json({
              success: true,
              title: parsed.title.trim(),
              category: parsed.category.trim(),
              location: parsed.location || null,
              room: parsed.room || null,
              is_complete: Boolean(parsed.is_complete),
              missing_info: parsed.missing_info || null,
              clarification_question: parsed.clarification_question || null,
              model: GEMINI_MODEL,
              source: 'gemini-live',
            });
          }
        } catch {
          // JSON parse failed, fall through to robust rule analyzer
        }
      }
    } catch {
      // Gemini unavailable or not configured - fallback below
    }

    // Comprehensive Fallback / Validator
    const lower = message.toLowerCase();
    let title = 'General Maintenance Request';
    let category = 'General Facilities';

    if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet') || lower.includes('network') || lower.includes('speed') || lower.includes('slow')) {
      category = 'IT/Network';
      if (lower.includes('slow') || lower.includes('speed') || lower.includes('low')) title = 'WiFi Slow Speed';
      else if (lower.includes('no internet') || lower.includes('not working')) title = 'Internet Not Working';
      else title = 'WiFi / Network Issue';
    } else if (lower.includes('spark') || lower.includes('electric') || lower.includes('light') || lower.includes('power') || lower.includes('fan') || lower.includes('socket') || lower.includes('wire')) {
      category = 'Electricity';
      if (lower.includes('spark')) title = 'Electrical Sparks Detected';
      else if (lower.includes('light') || lower.includes('bulb')) title = 'Light Not Working';
      else if (lower.includes('power cut') || lower.includes('no power')) title = 'Power Cut';
      else title = 'Electrical Issue';
    } else if (lower.includes('water') || lower.includes('leak') || lower.includes('tap') || lower.includes('pipe') || lower.includes('flood') || lower.includes('toilet') || lower.includes('drain')) {
      category = 'Plumbing';
      if (lower.includes('flood')) title = 'Flooding in Washroom';
      else if (lower.includes('leak') || lower.includes('leaking')) title = 'Water Leakage';
      else if (lower.includes('tap') || lower.includes('faucet')) title = 'Tap Not Working';
      else title = 'Plumbing Issue';
    } else if (lower.includes('ac') || lower.includes('air condition') || lower.includes('cooling') || lower.includes('hvac')) {
      category = 'HVAC/AC';
      if (lower.includes('not cooling') || lower.includes('no cool')) title = 'AC Not Cooling';
      else if (lower.includes('stopped') || lower.includes('not working')) title = 'AC Not Working';
      else title = 'AC / HVAC Issue';
    } else if (lower.includes('door') || lower.includes('lock') || lower.includes('window') || lower.includes('hinge')) {
      category = 'Carpentry';
      if (lower.includes('lock')) title = 'Door Lock Not Working';
      else if (lower.includes('door')) title = 'Door Issue';
      else title = 'Carpentry Issue';
    } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('extinguisher') || lower.includes('alarm')) {
      category = 'Fire System';
      title = 'Fire System Issue';
    } else if (lower.includes('lift') || lower.includes('elevator')) {
      category = 'General Facilities';
      title = 'Lift / Elevator Issue';
    } else if (lower.includes('garbage') || lower.includes('dirty') || lower.includes('clean') || lower.includes('pest')) {
      category = 'Housekeeping';
      title = 'Housekeeping Required';
    }

    // Location detection
    const hostelMatch = lower.match(/hostel\s+([a-t])\b/i) || lower.match(/\b([a-t])\s+hostel\b/i);
    const blockMatch = lower.match(/block\s+([a-g])\b/i) || lower.match(/\b([a-g])\s+block\b/i);
    const ltMatch = lower.match(/lt-?([0-9]{1,3})/i);
    const isCSED = lower.includes('csed') || lower.includes('server room');
    const isLibrary = lower.includes('library');

    const detectedLoc = hostelMatch 
      ? `Hostel ${hostelMatch[1].toUpperCase()}`
      : blockMatch 
        ? `Block ${blockMatch[1].toUpperCase()}`
        : ltMatch 
          ? `LT-${ltMatch[1]}`
          : isCSED 
            ? 'CSED'
            : isLibrary 
              ? 'Library'
              : null;

    // Room detection
    const roomMatch = lower.match(/(?:room|rm|no\.?)\s*([0-9]{1,4})\b/i);
    const isWashroom = lower.includes('washroom') || lower.includes('bathroom') || lower.includes('toilet');
    const isCorridor = lower.includes('corridor') || lower.includes('lobby') || lower.includes('hallway');
    const isFloor = lower.match(/(?:ground|first|second|third|[1-4](?:st|nd|rd|th))\s+floor/i);

    const detectedRoom = roomMatch 
      ? `Room ${roomMatch[1]}`
      : isWashroom 
        ? 'Washroom'
        : isCorridor 
          ? 'Corridor'
          : isFloor 
            ? isFloor[0]
            : null;

    // Completeness determination
    let isComplete = false;
    let missingInfo: string | null = null;
    let clarificationQuestion: string | null = null;

    if (detectedLoc && (detectedRoom || ltMatch || isLibrary || isCSED)) {
      isComplete = true;
    } else if (!detectedLoc && !detectedRoom) {
      isComplete = false;
      missingInfo = "building/hostel and room number";
      clarificationQuestion = `I can help register this ${category} issue (${title}), but I need your location details. Could you please provide your hostel/building name and room number?`;
    } else if (!detectedLoc) {
      isComplete = false;
      missingInfo = "building or hostel name";
      clarificationQuestion = `Which hostel or campus building is ${detectedRoom} located in?`;
    } else {
      isComplete = false;
      missingInfo = "room number or specific area";
      clarificationQuestion = `Which room number or area in ${detectedLoc} is affected?`;
    }

    return NextResponse.json({
      success: true,
      title,
      category,
      location: detectedLoc,
      room: detectedRoom,
      is_complete: isComplete,
      missing_info: missingInfo,
      clarification_question: clarificationQuestion,
      source: 'rule-analyzer',
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Classification failed', details: errorMsg },
      { status: 500 }
    );
  }
}
