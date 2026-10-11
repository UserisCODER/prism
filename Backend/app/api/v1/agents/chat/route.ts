 import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { NodeItem } from '@/lib/types/workspace';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      agentId,
      workspaceId,
      projectId,
      history = [],
      nodes = [],
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }
    if (!Array.isArray(history) || !Array.isArray(nodes)) {
      return NextResponse.json({ error: 'history and nodes must be arrays' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    // Retrieve agent profile if exists
    let agentName = 'AI Assistant';
    let agentPersona = 'Proactive Workspace Intelligence';
    let systemPrompt = 'You are an intelligent workspace agent powering an AI productivity workspace.';
    let modelTier = 'STANDARD';

    if (agentId) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .maybeSingle();

      if (agentData) {
        agentName = agentData.name;
        agentPersona = agentData.persona;
        systemPrompt = agentData.system_prompt;
        modelTier = agentData.model_tier || 'STANDARD';
      }
    }

    // Format current workspace nodes context
    const currentNodesText = (nodes as NodeItem[])
      .map(
        (n, i) =>
          `${i + 1}. [${n.status.toUpperCase()}] "${n.title}" (Priority: ${n.priority}, Assignee: ${n.assignee || 'None'})${
            n.content ? ` - ${n.content}` : ''
          }`
      )
      .join('\n');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelTier === 'REASONING' ? 'gemini-3.5-flash-lite' : 'gemini-3.5-flash-lite',
      systemInstruction: `You are ${agentName}, a specialized AI agent with the persona: "${agentPersona}".
${systemPrompt}

Current Project Nodes in the Workspace:
${currentNodesText || '(No items currently in project)'}

Your responsibilities:
1. Provide concise, clear, and actionable answers to the user.
2. If the user asks you to create a task, sub-task, or action item, you MUST include a JSON block at the very end of your response with the generated task(s) in this exact format:
\`\`\`tasks
[
  {
    "title": "Task title here",
    "content": "Short description",
    "status": "todo",
    "priority": "high",
    "assignee": "Name or Unassigned"
  }
]
\`\`\`
3. Otherwise, speak naturally in markdown format.`,
      generationConfig: {
        temperature: 0.2,
      },
    });

    const conversationHistoryPrompt = Array.isArray(history) && history.length > 0
      ? history.map((h: any) => `${h.sender === 'user' ? 'User' : agentName}: ${h.text}`).join('\n') + `\nUser: ${message}`
      : message;

    const result = await model.generateContent(conversationHistoryPrompt);
    const responseText = result.response.text();

    // Check if new tasks were suggested by the agent
    let createdTasks: any[] = [];
    let cleanText = responseText;

    const taskMatch = responseText.match(/```tasks\s*([\s\S]*?)\s*```/);
    if (taskMatch && taskMatch[1]) {
      try {
        const parsedTasks = JSON.parse(taskMatch[1]);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          if (!projectId) {
            return NextResponse.json(
              { error: 'The agent suggested tasks, but no project was selected to save them to.' },
              { status: 400 }
            );
          }
          createdTasks = parsedTasks
            .filter((task: any) => typeof task?.title === 'string' && task.title.trim())
            .map((t: any, idx: number) => ({
            id: crypto.randomUUID(),
            project_id: projectId,
            parent_id: null,
            title: t.title.trim(),
            content: t.content || '',
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            order_index: idx + (nodes?.length || 0),
            assignee: t.assignee || 'AI Agent',
            created_at: new Date().toISOString(),
          }));

          if (createdTasks.length > 0) {
            const { data: savedTasks, error: saveError } = await supabase
              .from('node_items')
              .insert(createdTasks)
              .select();
            if (saveError) {
              console.error('[API/V1/AGENTS/CHAT] Failed to save agent-created tasks:', saveError);
              return NextResponse.json({ error: 'The agent replied but its suggested tasks could not be saved.' }, { status: 500 });
            }
            createdTasks = savedTasks ?? [];
          }
        }
      } catch (e) {
        console.warn('Failed to parse suggested tasks JSON:', e);
      }

      // Strip the tasks code block from user-facing text
      cleanText = responseText.replace(/```tasks[\s\S]*?```/, '').trim();
    }

    return NextResponse.json({
      reply: cleanText,
      agent: {
        id: agentId,
        name: agentName,
        persona: agentPersona,
      },
      createdTasks,
    });
  } catch (err: any) {
    console.error('[API/V1/AGENTS/CHAT] Error:', err);
    return NextResponse.json({ error: err?.message || 'Agent failed to respond' }, { status: 500 });
  }
}
