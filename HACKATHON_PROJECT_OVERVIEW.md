# 🚀 PRISM — Hackathon Project Overview & Submission Brief

**Hackathon:** Hackwave 3.0  
**Problem Statement:** PS4 — Intent-to-Interface Adaptive Workspace  
**Project Name:** PRISM (Proactive Responsive Intelligent Surface Manager)  
**Live Repository:** [github.com/UserisCODER/prism](https://github.com/UserisCODER/prism)  
**Production URL:** [prism-topaz-one.vercel.app](https://prism-topaz-one.vercel.app)  

---

## 1. Executive Summary

**PRISM** is an autonomous AI workspace and generative application platform inspired by Taskade and Linear. It transforms a single natural language prompt into a fully functional, multi-view productivity application complete with:
1. **Dynamic Relational Schemas & Sample Datasets**
2. **Autonomous Domain-Specific AI Agents** with live tool-calling abilities
3. **Durable Visual DAG Workflow Automations**
4. **Interchangeable Multi-View Canvases** (List, Board, Mind Map, Table)

Instead of forcing users into manual drag-and-drop builder tools or static templates, PRISM leverages the **TSK-1 (Task System Kernel)** to assemble software on demand.

---

## 2. The Problem Statement & Market Pain

Traditional productivity stacks present three fundamental flaws:
- **The Setup Burden (The Blank Canvas Trap)**: Tools like Notion and Airtable require users to become database designers and formula writers before accomplishing work.
- **SaaS Fragmentation**: Teams use separate apps for task management (Linear/Jira), notes/docs (Notion), automation (Zapier), and AI interaction (ChatGPT), leading to massive context switching.
- **Static User Interfaces**: Software interfaces are pre-baked and inflexible; they cannot rearrange or synthesize views around what a user is trying to accomplish right now.

---

## 3. The PRISM Solution: Unified Context Loop

PRISM operates on a closed-loop system architecture called the **Workspace DNA**:
```
User Prompt (Natural Language)
        │
        ▼
   TSK-1 Kernel (Gemini 3.5 LLM with Strict JSON Output)
        │
   ┌────┴───────────────────────────┬──────────────────────────────┐
   ▼                                ▼                              ▼
Memory (Supabase DB)     Intelligence (Agents)        Execution (Workflows)
• Workspaces             • Custom System Prompts      • DAG Triggers
• Projects               • Tool Calling               • Actions & Alerts
• Node Items (Multi-View)• Persistent Context         • Step Execution Logs
   │                                │                              │
   └────────────────────────────────┴──────────────────────────────┘
                                    │
                                    ▼
                 Multi-View Adaptive Workspace Canvas
             [≡ List]  [⊞ Board]  [⑂ Mind Map]  [⊞ Table]
```

---

## 4. Key Architectural Modules

### 4.1. Natural Language Application Generator (`POST /api/v1/apps/generate`)
- Accepts a natural language prompt (e.g., *"Build a Client Onboarding Portal"*).
- Uses Google Gemini 3.5 with strict structured JSON constraints.
- Atomically creates and persists:
  - Workspace container and slug
  - Project instances with pre-populated hierarchical nodes
  - Custom agent definitions tailored to the workspace domain
  - Multi-step workflow DAG node maps

### 4.2. Unified Hierarchical Node Engine (`POST/PATCH/DELETE /api/v1/nodes`)
- A single data model (`node_items`) supports 4 distinct views:
  - **List View**: Nested bullet points with indent/outdent hierarchy.
  - **Board View (Kanban)**: Columns based on node status (`todo`, `in_progress`, `review`, `done`).
  - **Mind Map View**: Interactive React Flow visual graph showing parent-child node connections.
  - **Action Table View**: Spreadsheet grid with typed columns.

### 4.3. Autonomous AI Agent Orchestration (`POST /api/v1/agents/chat`)
- Agents possess custom personas, system prompts, and model tier configurations (`FAST`, `STANDARD`, `REASONING`).
- Evaluates active workspace nodes as live context.
- Can execute tool calls to create tasks or modify workspace records directly into Supabase.
- Deploys as an embeddable JavaScript widget (`GET /api/v1/agents/:id/embed.js`).

### 4.4. Durable Workflow Automation Engine (`POST /api/v1/workflows/run`)
- Executes graph-based workflow steps with trigger-action pipelines.
- Supports external webhook simulation, LLM evaluations, and database mutations.
- Persists execution step history and failure logs into `workflow_runs`.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 / Vite + Next.js 15 App Router, TypeScript |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Glassmorphic Design System |
| **Canvas & Graphing** | React Flow (Mind Map & DAG Workflows) |
| **Backend API** | Next.js API Routes (Node.js/TypeScript on Vercel) |
| **Database** | Supabase (PostgreSQL with UUID, Foreign Keys & Indexes) |
| **AI Kernel** | Google Gemini (`gemini-3.5-flash-lite`, `@google/generative-ai`) |

---

## 6. Database Schema Reference

```sql
-- Core Workspace Tables
workspaces (id, name, slug, description, icon, created_at)
workspace_projects (id, workspace_id, name, default_view, created_at)
node_items (id, project_id, parent_id, title, content, status, priority, order_index, assignee, tags, created_at)
agents (id, workspace_id, name, persona, system_prompt, model_tier, tools_assigned, avatar, created_at)
workflows (id, workspace_id, name, description, trigger_type, nodes, edges, is_active, created_at)
workflow_runs (id, workflow_id, status, logs, triggered_at, finished_at)
```

---

## 7. Future Roadmap
- **Real-Time Canvas Collaboration**: Integration of CRDTs via Yjs and WebSocket providers (Liveblocks).
- **RAG Knowledge Base Ingestion**: PDF document chunking, URL scraping, and vector embeddings using `pgvector`.
- **Public Agent Hub**: Community-shared agent templates and cross-workspace automations.
