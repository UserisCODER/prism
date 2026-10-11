import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { FullWorkspaceBundle, NodeItem, Workspace, WorkspaceProject, Agent, Workflow } from '@/lib/types/workspace';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json({ error: 'Valid prompt is required to generate an application' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY environment variable is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction: `You are TSK-1 (Task System Kernel), the core intelligence system powering an all-in-one AI app builder, project management system, and workflow automation engine.
Given the user's intent or app prompt, generate a production-ready application bundle in JSON format.

JSON Schema:
{
  "workspace": {
    "name": string,
    "description": string,
    "icon": string (Lucide icon name like "briefcase", "terminal", "users", "zap", "check-circle", "kanban", "rocket")
  },
  "projects": [
    {
      "name": string,
      "default_view": "board" | "list" | "mindmap" | "table",
      "nodes": [
        {
          "title": string,
          "content": string,
          "status": "todo" | "in_progress" | "review" | "done",
          "priority": "low" | "medium" | "high" | "critical",
          "assignee": string,
          "tags": string[]
        }
      ]
    }
  ],
  "agents": [
    {
      "name": string,
      "persona": string,
      "system_prompt": string,
      "model_tier": "FAST" | "STANDARD" | "REASONING",
      "tools_assigned": string[],
      "avatar": string
    }
  ],
  "workflows": [
    {
      "name": string,
      "description": string,
      "trigger_type": "schedule" | "webhook" | "item_change" | "manual",
      "nodes": [
        {
          "id": string,
          "type": "trigger" | "action" | "condition",
          "label": string,
          "action": string
        }
      ],
      "edges": [
        {
          "id": string,
          "source": string,
          "target": string
        }
      ]
    }
  ]
}

Rules:
1. Provide rich, realistic initial project items (at least 5-8 node items across statuses: todo, in_progress, review, done).
2. Configure at least 1-2 specialized AI agents tailored specifically to this application.
3. Configure at least 1 multi-step automated workflow DAG with 3-5 connected nodes.
4. Output ONLY valid JSON with no markdown wrapping.`,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const aiResult = await model.generateContent(`Generate full workspace application for: "${prompt}"`);
    const aiResponse = await aiResult.response;
    let rawText = aiResponse.text().trim();

    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const generated = JSON.parse(rawText);

    // Slugify workspace name
    const rawSlug = (generated.workspace?.name || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${rawSlug}-${Date.now().toString().slice(-4)}`;

    // Prepare response data with generated IDs
    const workspaceId = crypto.randomUUID();
    const createdWorkspace: Workspace = {
      id: workspaceId,
      name: generated.workspace?.name || prompt,
      slug,
      description: generated.workspace?.description || `AI Generated Workspace for: ${prompt}`,
      icon: generated.workspace?.icon || 'sparkles',
      created_at: new Date().toISOString(),
    };

    const hydratedProjects: Array<WorkspaceProject & { nodes: NodeItem[] }> = [];
    const allNodesToInsert: any[] = [];

    if (Array.isArray(generated.projects) && generated.projects.length > 0) {
      for (const p of generated.projects) {
        const projectId = crypto.randomUUID();
        const projectObj: WorkspaceProject = {
          id: projectId,
          workspace_id: workspaceId,
          name: p.name || 'Main Project',
          default_view: p.default_view || 'board',
          created_at: new Date().toISOString(),
        };

        const projectNodes: NodeItem[] = [];
        if (Array.isArray(p.nodes)) {
          p.nodes.forEach((n: any, index: number) => {
            const nodeId = crypto.randomUUID();
            const nodeObj: NodeItem = {
              id: nodeId,
              project_id: projectId,
              parent_id: null,
              title: n.title || `Item ${index + 1}`,
              content: n.content || '',
              status: n.status || 'todo',
              priority: n.priority || 'medium',
              order_index: index,
              assignee: n.assignee || 'Unassigned',
              tags: Array.isArray(n.tags) ? n.tags : [],
              created_at: new Date().toISOString(),
            };
            projectNodes.push(nodeObj);
            allNodesToInsert.push(nodeObj);
          });
        }

        hydratedProjects.push({
          ...projectObj,
          nodes: projectNodes,
        });
      }
    }

    // Build Agents
    const hydratedAgents: Agent[] = (Array.isArray(generated.agents) ? generated.agents : []).map((a: any) => ({
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      name: a.name || 'Workspace AI Assistant',
      persona: a.persona || 'Expert Assistant',
      system_prompt: a.system_prompt || 'You are an intelligent assistant for this workspace.',
      model_tier: a.model_tier || 'STANDARD',
      tools_assigned: Array.isArray(a.tools_assigned) ? a.tools_assigned : ['database_query', 'web_search'],
      avatar: a.avatar || 'bot',
      created_at: new Date().toISOString(),
    }));

    // Build Workflows
    const hydratedWorkflows: Workflow[] = (Array.isArray(generated.workflows) ? generated.workflows : []).map((w: any) => ({
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      name: w.name || 'Default Automation',
      description: w.description || '',
      trigger_type: w.trigger_type || 'manual',
      nodes: Array.isArray(w.nodes) ? w.nodes : [],
      edges: Array.isArray(w.edges) ? w.edges : [],
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    // Persist to Supabase asynchronously (if tables exist)
    try {
      await supabase.from('workspaces').insert([createdWorkspace]);

      for (const proj of hydratedProjects) {
        await supabase.from('workspace_projects').insert([{
          id: proj.id,
          workspace_id: proj.workspace_id,
          name: proj.name,
          default_view: proj.default_view,
        }]);
      }

      if (allNodesToInsert.length > 0) {
        await supabase.from('node_items').insert(allNodesToInsert);
      }

      if (hydratedAgents.length > 0) {
        await supabase.from('agents').insert(hydratedAgents);
      }

      if (hydratedWorkflows.length > 0) {
        await supabase.from('workflows').insert(hydratedWorkflows);
      }
    } catch (dbErr) {
      console.warn('[API/V1/APPS/GENERATE] Database write warning (fallback in-memory):', dbErr);
    }

    const bundle: FullWorkspaceBundle = {
      workspace: createdWorkspace,
      projects: hydratedProjects,
      agents: hydratedAgents,
      workflows: hydratedWorkflows,
    };

    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error: any) {
    console.error('[API/V1/APPS/GENERATE] Generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate application',
      details: error?.message || String(error),
    }, { status: 500 });
  }
}
