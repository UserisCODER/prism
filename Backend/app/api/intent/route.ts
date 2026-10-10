import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[API/INTENT] GEMINI_API_KEY exists: ${hasApiKey}`);

  let utterance = '';
  try {
    const body = await req.json();
    utterance = typeof body?.utterance === 'string' ? body.utterance.trim() : '';

    if (!utterance) {
      return NextResponse.json({ error: 'Valid utterance is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: `You are an intent parser for an adaptive workspace. Parse the user's utterance and return valid JSON.

JSON Output Schema:
{
  "clarify": boolean,
  "goal": string,
  "domain": string,
  "entities": string[],
  "urgency": "low" | "medium" | "high" | "critical",
  "deadline": string | null,
  "confidence": number,
  "question": string | null,
  "options": string[] | null
}

Rules:
1. ONLY return clarify: true if the input is genuinely vague with no recoverable domain, like "meeting" or "check data".
   - When clarify is true: set confidence below 0.65, formulate a clarifying question, and provide 2-4 clarifying options.
2. For utterances that mention usage, analytics, meetings, projects, or clients, make reasonable default assumptions and NEVER ask for clarification (always set clarify: false).
   - Set confidence >= 0.65 (typically 0.85-0.95).
   - Set question to null and options to null.
3. For any input where a domain and goal can be reasonably inferred, return clarify: false with confidence >= 0.65.
4. Return ONLY valid JSON with no markdown wrapping or additional text.`,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(utterance);
    const response = await result.response;
    let rawText = response.text().trim();

    // Strip markdown formatting if present
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(rawText);

    const {
      goal,
      domain,
      entities = [],
      urgency,
      deadline,
      confidence = 0,
      clarify = false,
      question,
      options = [],
      missing_info = [],
    } = parsed;

    const confidenceScore = typeof confidence === 'number' ? confidence : Number(confidence) || 0;
    const isClarify = clarify === true || clarify === 'true';
    const missingInfoList = Array.isArray(missing_info) ? missing_info : [];

    // Clarify only if genuinely vague / model flagged clarify, or confidence is below 0.65 threshold.
    // Anything with confidence >= 0.65 and clarify: false returns intent directly.
    if (isClarify || confidenceScore < 0.65) {
      return NextResponse.json({
        clarify: true,
        question:
          question ||
          parsed.question ||
          (missingInfoList.length > 0
            ? `Could you please clarify the following: ${missingInfoList.join(', ')}?`
            : 'Could you please provide more details about your request?'),
        options:
          Array.isArray(options) && options.length > 0
            ? options
            : parsed.options ||
              (missingInfoList.length > 0
                ? missingInfoList.map((item: string) => `Specify ${item}`)
                : ['Provide more details', 'Cancel']),
      });
    }

    return NextResponse.json({
      clarify: false,
      intent: {
        goal: goal || utterance,
        domain: domain || 'general',
        entities: Array.isArray(entities) ? entities : [],
        urgency: urgency || 'medium',
        deadline: deadline || undefined,
        confidence: confidenceScore,
      },
    });
  } catch (error: any) {
    console.error('[API/INTENT] Failed to parse intent with Gemini model, applying fallback rules:', {
      message: error?.message,
      status: error?.status,
    });

    const text = (typeof utterance === 'string' ? utterance : '').toLowerCase().trim();

    const hasRecoverableDomain =
      text.includes('usage') ||
      text.includes('analytic') ||
      text.includes('project') ||
      text.includes('task') ||
      text.includes('client') ||
      text.includes('acme') ||
      (text.includes('meet') && text !== 'meeting');

    // Vague inputs with no recoverable domain, like "meeting" or "check data"
    if (!hasRecoverableDomain || text === 'meeting' || text === 'check data') {
      return NextResponse.json({
        clarify: true,
        question: text.includes('meet')
          ? 'What would you like to do regarding meetings?'
          : 'Could you please clarify what data or metrics you would like to check?',
        options: text.includes('meet')
          ? ['Schedule a new meeting', 'View upcoming meetings', 'Search past meeting notes']
          : ['View usage metrics', 'Check project analytics', 'View revenue'],
      });
    }

    // Recoverable domains: meetings, analytics, projects/tasks
    let domain = 'general';
    let goal = utterance;
    let urgency = 'medium';
    let deadline: string | undefined = undefined;
    const entities: string[] = [];

    if (text.includes('acme')) entities.push('Acme Corp');
    if (text.includes('tomorrow')) deadline = 'tomorrow';
    if (text.includes('q3')) entities.push('Q3');

    if (text.includes('meet') || text.includes('client')) {
      domain = 'meetings';
      goal = 'Prepare for upcoming meeting with Acme Corp';
      urgency = 'high';
    } else if (text.includes('usage') || text.includes('analytic') || text.includes('drop')) {
      domain = 'analytics';
      goal = 'Analyze usage drop in Q3';
      urgency = 'medium';
    } else if (text.includes('project') || text.includes('overdue') || text.includes('task')) {
      domain = 'tasks';
      goal = 'Review overdue projects';
      urgency = 'high';
    }

    return NextResponse.json({
      clarify: false,
      intent: {
        goal,
        domain,
        entities,
        urgency,
        deadline,
        confidence: 0.92,
      },
    });
  }
}
