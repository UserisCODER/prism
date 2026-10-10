# 🚀 PRISM — Step-by-Step Guide: From Local Dev to Backend Collaboration & Vercel Deployment

> **Team Er Hustlers · Hackwave 3.0 · PS-4 / Human-Centered AI**
> Project Location: `C:\Users\HP\.gemini\antigravity\scratch\prism-app`

---

## 🛠️ Step 1: Run and Test Locally

1. Open your terminal in VS Code or PowerShell:
   ```bash
   cd C:\Users\HP\.gemini\antigravity\scratch\prism-app
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser. You can test:
   - **Scenario A**: "I need to prepare tomorrow's client meeting"
   - **Scenario B**: "Investigate the drop in product usage"
   - **Scenario C**: "Review overdue project work"
   - **Mid-Task Pivot**: "Actually, focus on the client at risk of churn"
   - **Web Speech API Voice Input**: Click the mic icon in the Intent Bar to speak!
   - **Panel Pinning & Undo**: Pin any panel and switch scenarios to watch it persist!

---

## 📦 Step 2: Initialize Git & Create GitHub Repository

1. Initialize Git in the project root:
   ```bash
   git init
   git add .
   git commit -m "feat: complete PRISM adaptive AI workspace frontend UI"
   ```

2. Create a new repository on GitHub:
   - Go to [GitHub New Repository](https://github.com/new).
   - Name it `prism-ai-workspace`.
   - Set it as **Public** or **Private**.
   - Do NOT add a `.gitignore` or `README` (you already have them).

3. Link your local repo and push to the `main` branch:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/prism-ai-workspace.git
   git branch -M main
   git push -u origin main
   ```

---

## 👥 Step 3: Add Backend Teammates as Collaborators

1. Go to your GitHub repository page: `https://github.com/YOUR_GITHUB_USERNAME/prism-ai-workspace`.
2. Click **Settings** → **Collaborators**.
3. Click **Add people** and enter your backend teammates' GitHub handles or email addresses.
4. Once they accept the invite, they can push directly to the `main` branch or create feature branches (e.g., `feat/backend-api`).

---

## 🔗 Step 4: How Backend Teammates Plug Into `main`

We built the frontend with a clean API service layer in `src/services/apiClient.ts`!
Your backend team does **NOT** need to rewrite any UI code.

### Instructions for your Backend Team:
1. Open `src/services/apiClient.ts`.
2. Change `USE_REAL_BACKEND = true`:
   ```typescript
   export const USE_REAL_BACKEND = true;
   ```
3. Update the endpoint fetch URL to point to your Next.js Route Handler, Express server, or Supabase Edge function:
   ```typescript
   const res = await fetch('/api/intent', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ utterance: rawInput }),
   });
   ```

---

## 🌐 Step 5: One-Click Deployment to Vercel

1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **Add New** → **Project**.
3. Import your GitHub repository (`prism-ai-workspace`).
4. Keep framework setting as **Vite** (Build Command: `npm run build`, Output Directory: `dist`).
5. Add any environment variables (e.g. `GEMINI_API_KEY`, `SUPABASE_URL`) under **Environment Variables**.
6. Click **Deploy**! 🚀

---

## 🏆 Presentation Script for Judges (Hackwave 3.0 Demo)

1. **Opening**: "Judges, modern apps force users to adapt to rigid dashboards. PRISM flips this: state your goal, and the workspace adapts to you."
2. **Scenario A (Client Meeting Prep)**: Click *Scenario A*. Point out the Acme Corp Hero, recent comms from Sarah, and strategic talking points.
3. **Scenario B (Usage Drop Audit)**: Click *Scenario B*. Highlight the -34% SMB anomaly callout hero and AI root cause explanation.
4. **Mid-Task Pivot (The Win Move)**: Type or click *"Actually, focus on the client at risk of churn"*. Show how the interface re-arranges live with FLIP animations while keeping pinned widgets intact!
5. **Explainability**: Click "Why am I seeing this?" on any widget to show grounding evidence and alignment scores.
