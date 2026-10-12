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
      model: process.env.GEMINI_MODEL || (modelTier === 'REASONING' ? 'gemini-2.5-flash' : 'gemini-1.5-flash'),
      systemInstruction: `You are ${agentName}, a proactive workspace intelligence agent with the persona: "${agentPersona}".
${systemPrompt}

Current Project Nodes in the Workspace:
${currentNodesText || '(No items currently in project)'}

CRITICAL RULES:
1. DIRECT DATA ACTION EXECUTION: You are an active agent that directly operates on workspace data and views. You do NOT simply describe what could be done or ask passive questions. When the user asks to open, inspect, view, create, update, delete, or manipulate tasks, or switch tabs/views/workspaces, you MUST execute these operations by providing a JSON \`\`\`actions code block at the very end of your response.
2. Structure of the \`\`\`actions code block:
\`\`\`actions
[
  {
    "type": "open_task",
    "taskId": "id-of-node",
    "taskTitle": "title of node",
    "field": "all",
    "label": "Opened task in Inspector"
  },
  {
    "type": "update_field",
    "taskId": "id-of-node",
    "taskTitle": "title of node",
    "field": "priority" | "status" | "assignee" | "due_date" | "content" | "title",
    "value": "critical" | "high" | "medium" | "low" | "done" | "in_progress" | "review" | "todo" | "new value",
    "label": "Updated <field> to <value>"
  },
  {
    "type": "create_task",
    "task": {
      "title": "Task title",
      "content": "Description / notes",
      "status": "todo" | "in_progress",
      "priority": "critical" | "high" | "medium" | "low",
      "assignee": "Name",
      "dueDate": "Tomorrow"
    },
    "label": "Created task <title>"
  },
  {
    "type": "delete_task",
    "taskId": "id-of-node",
    "label": "Deleted task <title>"
  },
  {
    "type": "switch_view",
    "target": "table" | "board" | "mindmap" | "calendar" | "list",
    "label": "Switched to <target> view"
  },
  {
    "type": "switch_workspace",
    "target": "salesforce" | "notion" | "github",
    "label": "Switched to <target> workspace"
  }
]
\`\`\`
3. If the user asks to "open Acme Corp..." or "open [task]", emit BOTH "switch_view" (target: "table") and "open_task" (taskId: matching node ID).
4. If the user asks to change or set a field (e.g., "set priority to critical", "assign to Sarah", "mark as review"), emit "update_field".
5. In your markdown text, give a brief, professional summary of the exact actions taken and fields modified. Do NOT output placeholder conversational loops like "Would you like me to draft an email...".`,
      generationConfig: {
        temperature: 0.2,
      },
    });

    const conversationHistoryPrompt = Array.isArray(history) && history.length > 0
      ? history.map((h: any) => `${h.sender === 'user' ? 'User' : agentName}: ${h.text}`).join('\n') + `\nUser: ${message}`
      : message;

    const result = await model.generateContent(conversationHistoryPrompt);
    const responseText = result.response.text();

    let createdTasks: any[] = [];
    let actions: any[] = [];
    let cleanText = responseText;

    // Parse ```actions block
    const actionMatch = responseText.match(/```actions\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      try {
        const parsedActions = JSON.parse(actionMatch[1]);
        if (Array.isArray(parsedActions)) {
          actions = parsedActions;
          for (const act of actions) {
            if (act.type === 'update_field' && act.taskId && act.field) {
              const fieldKey = act.field === 'due_date' || act.field === 'dueDate' ? 'due_date' : act.field;
              await supabase
                .from('node_items')
                .update({ [fieldKey]: act.value, updated_at: new Date().toISOString() })
                .eq('id', act.taskId);
            } else if (act.type === 'create_task' && act.task && projectId) {
              const t = act.task;
              const newTask = {
                id: crypto.randomUUID(),
                project_id: projectId,
                parent_id: null,
                title: t.title,
                content: t.content || '',
                status: t.status || 'todo',
                priority: t.priority || 'medium',
                order_index: (nodes?.length || 0) + createdTasks.length,
                assignee: t.assignee || 'AI Agent',
                due_date: t.dueDate || t.due_date || null,
                created_at: new Date().toISOString(),
              };
              createdTasks.push(newTask);
              await supabase.from('node_items').insert([newTask]);
            } else if (act.type === 'delete_task' && act.taskId) {
              await supabase.from('node_items').delete().eq('id', act.taskId);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse actions JSON:', e);
      }
      cleanText = cleanText.replace(/```actions[\s\S]*?```/, '').trim();
    }

    // Also support legacy ```tasks block
    const taskMatch = responseText.match(/```tasks\s*([\s\S]*?)\s*```/);
    if (taskMatch && taskMatch[1]) {
      try {
        const parsedTasks = JSON.parse(taskMatch[1]);
        if (Array.isArray(parsedTasks) && projectId) {
          for (const [idx, t] of parsedTasks.entries()) {
            const newTask = {
              id: crypto.randomUUID(),
              project_id: projectId,
              parent_id: null,
              title: t.title,
              content: t.content || '',
              status: t.status || 'todo',
              priority: t.priority || 'medium',
              order_index: idx + (nodes?.length || 0),
              assignee: t.assignee || 'AI Agent',
              created_at: new Date().toISOString(),
            };
            createdTasks.push(newTask);
            actions.push({
              type: 'create_task',
              taskId: newTask.id,
              taskTitle: newTask.title,
              label: `Created task "${newTask.title}"`,
            });
          }
          await supabase.from('node_items').insert(createdTasks);
        }
      } catch (e) {
        console.warn('Failed to parse suggested tasks JSON:', e);
      }
      cleanText = cleanText.replace(/```tasks[\s\S]*?```/, '').trim();
    }

    return NextResponse.json({
      reply: cleanText,
      agent: {
        id: agentId,
        name: agentName,
        persona: agentPersona,
      },
      createdTasks,
      actions: actions.length > 0 ? actions : undefined,
    });
  } catch (err: any) {
    console.error('[API/V1/AGENTS/CHAT] Error:', err);
    return NextResponse.json({ error: err?.message || 'Agent failed to respond' }, { status: 500 });
  }
}
