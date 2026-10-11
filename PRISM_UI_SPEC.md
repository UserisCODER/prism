# PRISM — UI Specification v1.0

> **Purpose:** Final, developer-ready UI spec for the PRISM adaptive workspace.
> **Audience:** Any developer implementing `app/demo/page.tsx`.
> **Time budget:** ~4–6 hours for a single developer.

---

## 1. What Makes Linear / Notion / Vercel Feel Like Real Products

Before diving into the spec, here's what separates a "demo" from a "product" — and what PRISM must nail:

### 1.1 The Shell Is Everything

Real workspaces have **an app shell** — a persistent frame that wraps all content. The content changes; the shell stays. This single pattern is what makes something feel like a product vs. a demo:

| Element | What it does | Examples |
|---------|-------------|----------|
| **Left sidebar** | Persistent navigation, workspace switching, identity | Linear's sidebar, Notion's page tree, VS Code's activity bar |
| **Top header** | Contextual breadcrumb, search/command bar, user avatar | Vercel's project header, GitHub's repo breadcrumb |
| **Main content area** | Dynamic content that changes with context | Everything else |

Without the shell, content is just floating cards on a dark background — which is exactly your mentor's critique.

### 1.2 Visual Density, Not Decoration

Great workspaces feel dense with information but never cluttered:
- **Tight spacing** (8px–12px gaps, not 24px+)
- **Subtle borders** (1px, low-contrast) instead of heavy shadows
- **Typographic hierarchy** via weight and size, not color variety
- **Monochrome with one accent** (Linear uses purple, GitHub uses blue, Vercel uses white)

### 1.3 Interaction Signals

Users know they're in a real app because things respond:
- Hover states on every interactive element
- Subtle transitions (150–200ms) on state changes
- Active/selected states in the sidebar
- Loading skeletons, not spinners

### 1.4 Information Architecture

Every screen answers: **"Where am I?" and "What can I do here?"**
- Breadcrumbs / page titles tell you where
- Clear CTAs tell you what to do
- Status indicators (dots, badges, labels) show state at a glance

---

## 2. App Shell Layout — The Foundation

### 2.1 Exact Dimensions

```
┌──────────────────────────────────────────────────────────────────────┐
│ ENTIRE VIEWPORT: 100vw × 100vh, overflow: hidden                    │
│                                                                      │
│ ┌──────────┬─────────────────────────────────────────────────────────┐│
│ │          │  HEADER (height: 56px)                                 ││
│ │          │  ┌─────────────────────────────────────────────────────┐││
│ │ SIDEBAR  │  │  Breadcrumb / Page Title    [Intent Bar]   [Avatar]│││
│ │ width:   │  └─────────────────────────────────────────────────────┘││
│ │ 240px    │                                                         ││
│ │          │  MAIN CONTENT (flex: 1, overflow-y: auto)               ││
│ │          │  ┌─────────────────────────────────────────────────────┐││
│ │          │  │                                                     │││
│ │          │  │  Panels rendered in zones                           │││
│ │          │  │  (hero → primary+secondary grid → rail)             │││
│ │          │  │                                                     │││
│ │          │  │  padding: 24px                                      │││
│ │          │  │  max-width: 1200px (centered)                       │││
│ │          │  │                                                     │││
│ │          │  └─────────────────────────────────────────────────────┘││
│ └──────────┴─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 CSS Layout Structure

```css
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0d1117;
  color: #e6edf3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: #010409;           /* slightly darker than main bg */
  border-right: 1px solid #21262d;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 56px;
  min-height: 56px;
  border-bottom: 1px solid #21262d;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  background: #0d1117;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}
```

---

## 3. Sidebar — Detailed Spec

### 3.1 Sidebar Sections (Top to Bottom)

```
┌─────────────────────┐
│  ◆ PRISM             │  ← Logo + name (always visible)
│                       │
│  ── Workspace ──      │  ← Section label (muted, uppercase, 10px)
│  ● Salesforce CRM     │  ← Active workspace (highlighted)
│  ○ GitHub             │
│  ○ Notion             │
│                       │
│  ── Navigation ──     │
│  🏠 Overview          │  ← Default landing (active state)
│  📋 Tasks             │
│  👥 Contacts          │
│  📊 Analytics         │
│  📂 Projects          │
│                       │
│  ── Quick Intents ──  │  ← Pre-loaded demo utterances
│  ▸ Meeting prep       │
│  ▸ Analytics deep-dive│
│  ▸ Task triage        │
│                       │
│  ─────────────────    │
│  ⚡ Powered by Gemini │  ← Footer badge
└─────────────────────┘
```

### 3.2 Sidebar Interaction Rules

| Element | Click behavior | Visual state |
|---------|---------------|--------------|
| Workspace item | Switches active workspace, changes available nav items and panel palette | Left blue border `3px solid #58a6ff` + bg `#161b22` |
| Nav item | Fires a default intent for that section (e.g., "Show me all tasks") | Same active style as workspace |
| Quick Intent | Fills the intent bar and auto-fires the pipeline | Brief flash highlight |

### 3.3 Sidebar Styling

```css
.sidebar-logo {
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #e6edf3;
}

.sidebar-logo .logo-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-section-label {
  padding: 20px 16px 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #484f58;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  font-size: 13px;
  color: #8b949e;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: #161b22;
  color: #c9d1d9;
}

.sidebar-item.active {
  background: #161b22;
  color: #e6edf3;
  border-left-color: #58a6ff;
}

.sidebar-item .item-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}
```

---

## 4. Header — Detailed Spec

### 4.1 Header Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  Salesforce CRM / Overview       │ ◆ What are you trying to do?  ▶  │  PS
│  (breadcrumb, 13px, muted)       │   (intent bar, centered, 400px)   │  (avatar)
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Three Sections

| Section | Position | Content |
|---------|----------|---------|
| **Left: Breadcrumb** | `flex: 0 0 auto` | `{Workspace Name} / {Current View}` — e.g., "Salesforce CRM / Meeting Prep" |
| **Center: Intent Bar** | `flex: 1, max-width: 560px, margin: 0 auto` | The command input — this is the star of the show |
| **Right: Status** | `flex: 0 0 auto` | PRISM status dot (green = ready) + user avatar circle |

### 4.3 Intent Bar — The Command Center

The intent bar is PRISM's primary input. It should look like a search bar crossed with a command palette:

```css
.intent-bar {
  flex: 1;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 0 4px 0 14px;
  height: 36px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.intent-bar:focus-within {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
}

.intent-bar input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e6edf3;
  font-size: 13px;
  font-family: inherit;
}

.intent-bar input::placeholder {
  color: #484f58;
}

.intent-bar .submit-btn {
  height: 28px;
  padding: 0 12px;
  background: #238636;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.intent-bar .submit-btn:hover {
  background: #2ea043;
}

/* Keyboard hint inside the input */
.intent-bar .kbd-hint {
  font-size: 10px;
  color: #484f58;
  padding: 2px 6px;
  background: #21262d;
  border-radius: 4px;
  margin-right: 8px;
  font-family: monospace;
}
```

**Inside the intent bar (left to right):**
1. Small prism icon (◆, 14px, color `#58a6ff`)
2. Input placeholder: `"What are you trying to do?"`
3. Keyboard hint badge: `⌘K` (rendered as small pill)
4. Submit button: `Run ▶` (green, 28px tall)

### 4.4 Intent Bar States

| State | Visual |
|-------|--------|
| **Idle** | Placeholder text, border `#30363d` |
| **Focused** | Border `#58a6ff`, blue glow `box-shadow` |
| **Loading** | Input disabled, button shows animated dots `⠋⠙⠹⠸`, border pulses blue |
| **Clarification** | See Section 5 below — inline dropdown appears below the bar |
| **Success** | Brief green flash on border (200ms), then back to idle |
| **Error** | Border `#f85149`, error text appears below for 3s |

---

## 5. Clarification Flow — Inline, Not Modal

This is the key feature your mentor asked for. When the user types something vague like "client meeting", PRISM should:

1. Detect ambiguity via `/api/intent` (returns `clarify: true`)
2. Show a clarification dropdown **directly below the intent bar** (not a modal, not a separate panel)
3. Populate options with **real data from the database** (actual client names, not generic options)
4. User picks an option → input is refined → pipeline runs with specific data

### 5.1 Clarification UI Structure

```
                    ┌─────────────────────────────────────────┐
                    │ ◆ client meeting                    ▶   │  ← Intent bar
                    └─────────────────────────────────────────┘
                    ┌─────────────────────────────────────────┐
                    │  🤖 Which client are you meeting with?   │  ← Question (13px)
                    │                                          │
                    │  ┌─────────────────────────────────────┐ │
                    │  │  🏢 Acme Corp                       │ │  ← Option card
                    │  │     Enterprise · Active · $120K ARR  │ │     (with metadata)
                    │  └─────────────────────────────────────┘ │
                    │  ┌─────────────────────────────────────┐ │
                    │  │  🏢 TechFlow Inc                    │ │
                    │  │     Mid-Market · Active · $45K ARR   │ │
                    │  └─────────────────────────────────────┘ │
                    │  ┌─────────────────────────────────────┐ │
                    │  │  🏢 Meridian Labs                   │ │
                    │  │     Startup · At Risk · $18K ARR     │ │
                    │  └─────────────────────────────────────┘ │
                    │                                          │
                    │  Or type to refine your request...       │  ← Hint (muted)
                    └─────────────────────────────────────────┘
```

### 5.2 Clarification CSS

```css
.clarification-dropdown {
  position: absolute;
  top: 100%;              /* directly below intent bar */
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 560px;       /* match intent bar width */
  margin-top: 8px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 100;
  animation: clarify-enter 0.2s ease-out;
}

@keyframes clarify-enter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.clarification-question {
  font-size: 13px;
  color: #c9d1d9;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clarification-question .ai-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.clarification-option {
  padding: 10px 12px;
  border: 1px solid #21262d;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clarification-option:hover {
  background: #21262d;
  border-color: #58a6ff;
}

.clarification-option:active {
  background: #30363d;
}

.clarification-option .option-title {
  font-size: 13px;
  font-weight: 600;
  color: #e6edf3;
}

.clarification-option .option-meta {
  font-size: 11px;
  color: #8b949e;
  margin-top: 2px;
}

.clarification-hint {
  font-size: 11px;
  color: #484f58;
  margin-top: 10px;
  text-align: center;
}
```

### 5.3 Clarification Flow — Backend Enhancement Required

The current `/api/intent` route returns generic options like `["Schedule a new meeting", "View upcoming meetings"]`. For the mentor's requirement (showing actual client names), you need to **enhance the clarification response** to fetch real entities from Supabase.

**Recommended approach (minimal API change):**

Add a new endpoint `GET /api/clarify?type=clients` (or `type=projects`, `type=meetings`) that queries Supabase and returns entity options with metadata:

```json
// GET /api/clarify?type=clients
{
  "question": "Which client are you meeting with?",
  "options": [
    { "label": "Acme Corp", "value": "Acme Corp", "meta": "Enterprise · Active · $120K ARR" },
    { "label": "TechFlow Inc", "value": "TechFlow Inc", "meta": "Mid-Market · Active · $45K ARR" },
    { "label": "Meridian Labs", "value": "Meridian Labs", "meta": "Startup · At Risk · $18K ARR" }
  ]
}
```

When the user picks an option, the frontend refines the utterance:
- Original: `"client meeting"`
- Refined: `"Prepare for client meeting with Acme Corp"`
- This refined utterance is sent to `/api/intent` → gets `clarify: false` → pipeline continues normally.

---

## 6. Main Content Area — Panel Zones

### 6.1 Zone Layout

The main content area uses the existing 4-zone system but styled to feel like a real dashboard, not floating cards:

```
┌──────────────────────────────────────────────────────────────────┐
│  HERO ZONE                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Full-width panel — meeting brief, KPI row, etc.             │ │
│  │  height: auto (content-driven), min-height: 100px            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  gap: 16px                                                        │
│  ┌──────────────────────────────┐ ┌─────────────────────────────┐ │
│  │  PRIMARY ZONE (flex: 5)      │ │  SECONDARY ZONE (flex: 3)   │ │
│  │                              │ │                              │ │
│  │  client_overview             │ │  talking_points              │ │
│  │  ┌──────────────────────────┐│ │  ┌──────────────────────────┐│ │
│  │  │  Panel card              ││ │  │  Panel card              ││ │
│  │  └──────────────────────────┘│ │  └──────────────────────────┘│ │
│  │                              │ │                              │ │
│  │  contact_card                │ │  trend_chart                 │ │
│  │  ┌──────────────────────────┐│ │  ┌──────────────────────────┐│ │
│  │  │  Panel card              ││ │  │  Panel card              ││ │
│  │  └──────────────────────────┘│ │  └──────────────────────────┘│ │
│  └──────────────────────────────┘ └─────────────────────────────┘ │
│  gap: 16px                                                        │
│  RAIL ZONE                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Horizontal flex-wrap — quick actions, compact panels         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Zone CSS

```css
.zone-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.zone-hero {
  width: 100%;
}

.zone-grid {
  display: flex;
  gap: 16px;
}

.zone-primary {
  flex: 5;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;          /* prevent flex overflow */
}

.zone-secondary {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.zone-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
```

### 6.3 Panel Card Styling

Every panel card should look like a Linear issue card or a Notion database row — clean, dense, with a clear hierarchy:

```css
.panel-card {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.panel-card:hover {
  border-color: #30363d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.panel-card .panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-card .panel-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8b949e;
}

.panel-card .panel-zone-badge {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #21262d;
  color: #484f58;
}

.panel-card .panel-body {
  font-size: 13px;
  line-height: 1.6;
  color: #e6edf3;
}

.panel-card .panel-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #21262d;
}

/* Why button (now integrated into panel footer) */
.btn-why {
  font-size: 11px;
  font-weight: 500;
  color: #8b949e;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-why:hover {
  color: #58a6ff;
  border-color: #58a6ff;
}

/* Pin button */
.btn-pin {
  font-size: 11px;
  color: #8b949e;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-pin:hover {
  color: #f0883e;
  border-color: #f0883e;
}

.btn-pin.pinned {
  color: #f0883e;
  border-color: #f0883e;
  background: rgba(240, 136, 62, 0.1);
}
```

---

## 7. Panel Component Rendering — Per Workspace

Each workspace type shares the same shell but renders different panel content:

### 7.1 Salesforce CRM Panels

| component_id | Renders | Data |
|---|---|---|
| `meeting_prep_brief` | Meeting name, date, attendee count, summary | `data.meetings[0]` |
| `client_overview` | Client name, tier, status, ARR, health score badge | `data.clients[0]` |
| `contact_card` | Contact name, role, email, sentiment indicator | `data.contacts[0]` |
| `kpi_row` | 3 inline KPI boxes (metric + value) | `data.usage[-3:]` |
| `task_list` | Checkbox list: task name, status, due date | `data.tasks[:3]` |
| `project_health_card` | Project name, status, due date, progress bar | `data.projects[0]` |
| `talking_points` | Bullet list of AI-suggested topics | `panel.reason` |
| `suggested_actions` | 2 CTA buttons: Take Action, View Details | Static |

### 7.2 GitHub Panels

| component_id | Renders | Data |
|---|---|---|
| `pr_list` | PR title, author, status badge, branch, review count | `data.prs[:5]` |
| `issue_tracker` | Issue title, label badge, assignee, priority | `data.issues[:5]` |
| `failing_tests` | CI run branch, status (pass/fail badge), duration | `data.ci_runs[:5]` |
| `deploy_status` | Latest deploy branch, status, triggered by | `data.ci_runs[0]` |
| `suggested_actions` | CTA buttons specific to code workflow | Static |

### 7.3 Notion Panels

| component_id | Renders | Data |
|---|---|---|
| `notion_pages` | Page title, type badge, owner, last edited date | `data.pages[:5]` |
| `notion_tasks` | Task title, assignee, status, due date, priority | `data.tasks[:5]` |
| `notion_activity` | Recent activity feed (last edited pages) | `data.pages` |
| `suggested_actions` | CTA buttons for docs workflow | Static |

---

## 8. Workspace-Specific Sidebar Navigation

The sidebar nav items change based on which workspace is active:

| Workspace | Nav Items |
|-----------|-----------|
| **Salesforce CRM** | 🏠 Overview · 📋 Tasks · 👥 Contacts · 📊 Analytics · 📂 Projects · 📅 Meetings |
| **GitHub** | 🏠 Overview · 🔀 Pull Requests · 🐛 Issues · 🚀 Deployments · ⚡ CI/CD |
| **Notion** | 🏠 Overview · 📄 Pages · ✅ Tasks · 📝 Recent Edits |

---

## 9. Animations & Transitions

### 9.1 Panel Entry/Exit (Delta Transitions)

```css
@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes panel-exit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

.panel-entering {
  animation: panel-enter 0.3s ease-out forwards;
}

.panel-exiting {
  animation: panel-exit 0.25s ease-in forwards;
}
```

### 9.2 Loading Skeletons

Instead of a spinner, show shimmering skeleton cards in the zone layout:

```css
.skeleton-panel {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 16px;
  overflow: hidden;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short { width: 40%; }
.skeleton-line.medium { width: 70%; }
.skeleton-line.long { width: 100%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 9.3 Sidebar Workspace Switch

```css
.sidebar-item {
  transition: all 0.15s ease;
}

.main-content {
  transition: opacity 0.2s ease;
}

.main-content.switching {
  opacity: 0.5;
  pointer-events: none;
}
```

---

## 10. Complete Color Token Reference

```css
:root {
  /* Backgrounds */
  --bg-canvas:      #0d1117;   /* Main content area */
  --bg-inset:       #010409;   /* Sidebar, deepest layer */
  --bg-surface:     #161b22;   /* Cards, elevated surfaces */
  --bg-overlay:     #1c2128;   /* Dropdowns, popovers */
  --bg-subtle:      #21262d;   /* Badges, skeleton bg, input bg */

  /* Borders */
  --border-default: #21262d;   /* Card borders, dividers */
  --border-muted:   #30363d;   /* Input borders, subtle lines */

  /* Text */
  --text-primary:   #e6edf3;   /* Body text, headings */
  --text-secondary: #c9d1d9;   /* Explanations, metadata */
  --text-muted:     #8b949e;   /* Labels, placeholders */
  --text-faint:     #484f58;   /* Disabled text, hints */

  /* Accents */
  --accent-blue:    #58a6ff;   /* Links, focus rings, active states */
  --accent-green:   #238636;   /* Success, primary buttons */
  --accent-green-h: #2ea043;   /* Green hover */
  --accent-purple:  #a371f7;   /* AI indicator, gradient pair */
  --accent-orange:  #f0883e;   /* Pinned state */
  --accent-red:     #f85149;   /* Error, destructive */
  --accent-yellow:  #e3b341;   /* Warning, at-risk status */

  /* Status */
  --status-open:    #238636;   /* Active, open */
  --status-closed:  #8b949e;   /* Closed, resolved */
  --status-risk:    #f85149;   /* At risk, overdue */
  --status-pending: #e3b341;   /* In progress, pending */
}
```

---

## 11. Typography

```css
/* Load Inter from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

/* Type scale */
.text-xs   { font-size: 10px; line-height: 1.4; }
.text-sm   { font-size: 12px; line-height: 1.5; }
.text-base { font-size: 13px; line-height: 1.6; }
.text-lg   { font-size: 15px; line-height: 1.5; }
.text-xl   { font-size: 18px; line-height: 1.4; }
```

---

## 12. Empty State — When No Intent Has Been Fired

Before the user types anything, the main content area should show a welcoming empty state:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                         ◆                                          │
│                     (prism icon)                                   │
│                                                                    │
│              Tell PRISM what you're working on                     │
│          Type an intent above, or try a quick action:              │
│                                                                    │
│     ┌─────────────┐ ┌──────────────┐ ┌───────────────┐           │
│     │ 🤝 Meeting  │ │ 📊 Analytics │ │ ✅ Task       │           │
│     │    Prep     │ │    Review    │ │    Triage     │           │
│     └─────────────┘ └──────────────┘ └───────────────┘           │
│                                                                    │
│       "Prep for the Acme Corp meeting tomorrow"                    │
│       "Why did usage drop last quarter?"                           │
│       "Show me overdue tasks across all projects"                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Style the empty state with very muted colors and the prism gradient icon as a centerpiece.

---

## 13. Responsive Behavior

For the hackathon demo (laptop screens, 1280px+), the layout is optimized for wide screens. However, add these graceful breakpoints:

| Breakpoint | Change |
|-----------|--------|
| **< 1024px** | Sidebar collapses to 56px (icons only), main content fills remaining space |
| **< 768px** | Zone grid stacks vertically (primary above secondary), sidebar hidden by default |

---

## 14. Implementation Order (Recommended)

For a hackathon with limited time, build in this order:

1. **Shell** (~45 min): Sidebar + header + main area with empty state. This alone makes it look like a product.
2. **Intent bar** (~30 min): Input, submit, loading states.
3. **Panel rendering** (~60 min): Zone layout + panel card styling for the 3 CRM panels (meeting_prep_brief, client_overview, contact_card).
4. **Clarification flow** (~45 min): Inline dropdown, option cards, refinement logic.
5. **Why + Pin** (~20 min): Footer actions on each panel card.
6. **Workspace switching** (~30 min): Sidebar clicks change workspace context.
7. **GitHub + Notion panels** (~45 min): Render pr_list, issue_tracker, notion_pages, etc.
8. **Delta transitions** (~30 min): Panel enter/exit animations on follow-up queries.
9. **Polish** (~30 min): Skeletons, hover states, empty state, keyboard shortcut.

**Total: ~5.5 hours for a complete, polished workspace.**

---

## 15. Key Architectural Diagram

Include this in the demo page as an SVG or rendered component:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Natural    │     │   Intent    │     │   Layout    │     │   Panel     │
│  Language    │────▶│   Parser    │────▶│   Engine    │────▶│  Renderer   │
│  Utterance   │     │  (Gemini)   │     │  (Gemini)   │     │  (React)    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └─────────────┘
                           │                    │
                    ┌──────▼──────┐      ┌──────▼──────┐
                    │  Clarify?   │      │  Supabase   │
                    │  ─ yes ───▶ │      │  (Postgres) │
                    │  show       │      │  Real Data  │
                    │  options    │      └─────────────┘
                    └─────────────┘
```

---

## 16. Diff from Current State

Here's exactly what changes between what you have now and this spec:

| Current | New |
|---------|-----|
| Dark background with floating panels | App shell with sidebar + header wrapping content |
| Intent bar is inside the overlay | Intent bar is in the header (always visible) |
| Clarification shows as a panel | Clarification shows as a dropdown below intent bar with real entity data |
| No workspace switching | Sidebar has 3 workspaces with visual switching |
| No navigation structure | Sidebar has contextual nav items |
| Panels use `content.js` DOM rendering | Panels use React components with same data logic |
| No empty state | Welcoming empty state with quick actions |
| Extension overlay positioning | Full-viewport app layout |
| No loading skeletons | Shimmer skeleton panels during loading |
| Generic clarification options | Entity-specific options pulled from Supabase |

---

> [!TIP]
> **For the hackathon judges:** The clarification flow is PRISM's killer feature. When you demo, start with a vague intent ("client meeting"), show the inline clarification with real client names, pick one, and watch the workspace reshape. This is the "wow" moment.
