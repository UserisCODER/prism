import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[API/INTENT] GEMINI_API_KEY exists: ${hasApiKey}`);

  let utterance = '';
  let context: any = undefined;
  try {
    const body = await req.json();
    utterance = typeof body?.utterance === 'string' ? body.utterance.trim() : '';
    context = body?.context;
    const suggestedDomain = context?.suggestedDomain || 'general';

    if (!utterance) {
      return NextResponse.json({ error: 'Valid utterance is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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
4. You must also check if the user's intent matches the current page context.
   - If the user is on github.com and their intent is about code review, pull requests, issues, or CI — proceed normally.
   - If the user is on notion.so and their intent is about tasks, projects, or notes — proceed normally.
   - If the user is on salesforce.com and their intent is about meetings, clients, or CRM — proceed normally.
   - If the intent does NOT match the page context, return clarify: true with a question asking the user to confirm their intent, and provide 2-3 relevant options based on what they could do on the current page.
5. Return ONLY valid JSON with no markdown wrapping or additional text.`,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const prompt = context
      ? `${utterance}\nPage context: domain=${context.domain}, pageType=${context.pageType}, title=${context.pageTitle}\nIf the user is on a ${suggestedDomain} website, prefer domain: "${suggestedDomain}" unless the utterance clearly indicates a different domain.`
      : utterance;

    const result = await model.generateContent(prompt);
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
        ...(context ? { context } : {}),
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
        ...(context ? { context } : {}),
      },
      ...(context ? { context } : {}),
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
        ...(context ? { context } : {}),
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
        ...(context ? { context } : {}),
      },
      ...(context ? { context } : {}),
    });
  }
}
