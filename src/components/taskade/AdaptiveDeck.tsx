import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  LayoutGrid,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import './AdaptiveDeck.css';

export type AdaptiveScenarioId = 'generic' | 'meeting_prep' | 'usage_drop' | 'overdue_work';

interface AdaptiveDeckProps {
  initialScenario?: AdaptiveScenarioId;
  onSwitchView?: (view: 'list' | 'board' | 'mindmap' | 'table' | 'calendar') => void;
  onOpenAgentChat?: (message?: string) => void;
  onTriggerAction?: (actionName: string, detail: string) => void;
}

export const AdaptiveDeck: React.FC<AdaptiveDeckProps> = ({
  initialScenario = 'meeting_prep',
  onSwitchView,
  onOpenAgentChat,
  onTriggerAction,
}) => {
  const [activeScenario, setActiveScenario] = useState<AdaptiveScenarioId>(initialScenario);
  const [intentQuery, setIntentQuery] = useState('');
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([]);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleActionClick = (id: string, label: string, detail: string) => {
    setAppliedActions((prev) => ({ ...prev, [id]: true }));
    showToast(`Applied: ${label}`);
    if (onTriggerAction) {
      onTriggerAction(label, detail);
    }
  };

  const handleIntentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = intentQuery.trim().toLowerCase();
    if (!q) return;

    // Ambiguity check
    if (q === 'meeting' || q === 'prepare meeting' || q === 'check clients') {
      setClarifyingQuestion('Which client meeting would you like to prepare for?');
      setClarifyingOptions([
        'Meridian Labs / Acme Enterprise',
        'Vertex Systems',
        'Northwind Analytics',
      ]);
      return;
    }

    setClarifyingQuestion(null);

    if (q.includes('meeting') || q.includes('acme') || q.includes('client') || q.includes('meridian') || q.includes('prepare')) {
      setActiveScenario('meeting_prep');
      showToast('Workspace dynamically adapted for: Client Meeting Prep');
    } else if (q.includes('usage') || q.includes('drop') || q.includes('drop in') || q.includes('smb') || q.includes('why did usage')) {
      setActiveScenario('usage_drop');
      showToast('Workspace dynamically adapted for: Usage Drop Diagnostic');
    } else if (q.includes('overdue') || q.includes('late') || q.includes('blocker') || q.includes('deadline') || q.includes('deliverable')) {
      setActiveScenario('overdue_work');
      showToast('Workspace dynamically adapted for: Overdue Project Work');
    } else if (q.includes('generic') || q.includes('reset') || q.includes('dashboard') || q.includes('overview') || q.includes('all')) {
      setActiveScenario('generic');
      showToast('Reset to Generic Workspace Dashboard');
    } else {
      // Default to meeting prep as high confidence match
      setActiveScenario('meeting_prep');
      showToast(`Adapted workspace around goal: "${intentQuery}"`);
    }
  };

  const selectClarification = (option: string) => {
    setClarifyingQuestion(null);
    if (option.includes('Meridian') || option.includes('Acme')) {
      setActiveScenario('meeting_prep');
      showToast(`Clarified intent: Preparing meeting for ${option}`);
    } else {
      setActiveScenario('meeting_prep');
      showToast(`Adapted context for ${option}`);
    }
  };

  return (
    <div className="td-adaptive-deck-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="td-adaptive-toast" role="status">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Hackathon Demo Switcher */}
      <section className="td-adaptive-hero-banner">
        <div className="td-adaptive-hero-top">
          <div>
            <div className="td-adaptive-eyebrow">
              <Sparkles size={13} />
              <span>AI-Powered Adaptive Workspace</span>
            </div>
            <h1 className="td-adaptive-title">
              Interface adapts to the user's goal — not the other way around.
            </h1>
            <p className="td-adaptive-subtitle">
              Instead of forcing users to hunt across fixed dashboards, PRISM parses intent and dynamically synthesizes the exact context, telemetry, and actions needed.
            </p>
          </div>

          <div className="td-adaptive-stats-badge">
            <div className="td-badge-num">3 Tasks</div>
            <div className="td-badge-label">Real-Time UI Reorganization</div>
          </div>
        </div>

        {/* 3 Core Hackathon Demo Task Switchers */}
        <div className="td-scenario-switcher-bar" role="group" aria-label="Select demo task">
          <span className="td-switcher-label">Demo Tasks:</span>
          <button
            type="button"
            className={`td-scenario-btn ${activeScenario === 'generic' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveScenario('generic');
              setClarifyingQuestion(null);
              showToast('Switched to Generic Dashboard');
            }}
          >
            <BarChart3 size={14} />
            <span>0. Generic Dashboard</span>
          </button>

          <button
            type="button"
            className={`td-scenario-btn ${activeScenario === 'meeting_prep' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveScenario('meeting_prep');
              setClarifyingQuestion(null);
              showToast('Adapted to Client Meeting Prep Mode');
            }}
          >
            <Users size={14} />
            <span>1. Prepare for Client Meeting</span>
          </button>

          <button
            type="button"
            className={`td-scenario-btn ${activeScenario === 'usage_drop' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveScenario('usage_drop');
              setClarifyingQuestion(null);
              showToast('Adapted to Usage Drop Diagnostic Mode');
            }}
          >
            <TrendingDown size={14} />
            <span>2. Investigate Usage Drop</span>
          </button>

          <button
            type="button"
            className={`td-scenario-btn ${activeScenario === 'overdue_work' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveScenario('overdue_work');
              setClarifyingQuestion(null);
              showToast('Adapted to Overdue Project Work Mode');
            }}
          >
            <ShieldAlert size={14} />
            <span>3. Review Overdue Project Work</span>
          </button>
        </div>

        {/* Natural Language Intent Bar */}
        <form className="td-adaptive-intent-bar" onSubmit={handleIntentSubmit}>
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={intentQuery}
            onChange={(e) => setIntentQuery(e.target.value)}
            placeholder="Type any goal in natural language (e.g. 'I need to prepare tomorrow\'s client meeting', 'Why did usage drop?', 'Show overdue tasks')..."
            aria-label="Enter your goal"
          />
          <button type="submit" className="td-adapt-submit-btn">
            <Sparkles size={13} />
            <span>Adapt Workspace</span>
          </button>
        </form>

        {/* Ambiguity Clarification Prompt Modal / Box */}
        {clarifyingQuestion && (
          <div className="td-clarification-banner animate-fade-in" role="alert">
            <div className="td-clarify-head">
              <HelpCircle size={16} className="text-amber-500" />
              <strong>Clarifying Ambiguity: {clarifyingQuestion}</strong>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Confidence was below threshold (65%). Please select which client account you are referring to:
            </p>
            <div className="td-clarify-options mt-2">
              {clarifyingOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="td-clarify-opt-btn"
                  onClick={() => selectClarification(opt)}
                >
                  <ArrowRight size={12} />
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Dynamic Scenario Layouts */}
      {activeScenario === 'meeting_prep' && (
        <section className="td-adaptive-workspace-view animate-fade-in">
          {/* Intent & Explainability Banner */}
          <div className="td-intent-meta-card">
            <div className="td-intent-meta-header">
              <div className="flex items-center gap-2">
                <span className="td-intent-pill td-pill-sales">Domain: Client Accounts</span>
                <span className="td-intent-pill td-pill-high">Priority: High</span>
                <span className="td-intent-pill td-pill-conf">96% Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Prepare tomorrow's quarterly review with Acme Corp</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon">
                <Info size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  Matched calendar invite <em>"Acme Corp - Quarterly Account Review"</em> (Tomorrow at 10:00 AM). Surfaced client overview, attendee profiles, agenda, recent email threads, and recommended talking points.
                </p>
              </div>
            </div>
          </div>

          {/* Grid of Task-Tailored Components */}
          <div className="td-adaptive-grid">
            {/* Card 1: Client Overview & Context */}
            <article className="td-deck-card td-col-span-8">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Client Overview</span>
                  <h3 className="td-card-title">Acme Corp</h3>
                </div>
                <span className="td-health-badge td-badge-at-risk">88 / 100 Health Score (Healthy)</span>
              </header>

              <div className="td-deck-card-body">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Contract ARR</span>
                    <p className="text-lg font-bold text-slate-900">$120,000</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Industry</span>
                    <p className="text-sm font-semibold text-slate-800">Technology & SaaS</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Account Owner</span>
                    <p className="text-sm font-semibold text-slate-800">Priya Sharma</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Renewal Date</span>
                    <p className="text-sm font-semibold text-slate-800">Next Month (Q4)</p>
                  </div>
                </div>

                <div className="td-client-notes p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong>Account Summary:</strong> Acme Corp has been an enterprise customer for 2 years. They have 150 active seats with 94% weekly engagement. The upcoming meeting focuses on their annual contract renewal and expanding into 25 additional developer seats.
                </div>
              </div>
            </article>

            {/* Card 2: Key Stakeholders & Sentiment */}
            <article className="td-deck-card td-col-span-4">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Meeting Attendees</span>
                  <h3 className="td-card-title">Stakeholder Sentiment</h3>
                </div>
                <Users size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-3">
                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-blue-100 text-blue-700 font-bold">SL</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Sarah Lin</strong>
                    <span className="text-[11px] text-slate-500 block">VP of Product</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-positive">Satisfied</span>
                </div>

                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-purple-100 text-purple-700 font-bold">MV</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Marcus Vance</strong>
                    <span className="text-[11px] text-slate-500 block">Finance Director</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-at-risk">Reviewing Quote</span>
                </div>

                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-emerald-100 text-emerald-700 font-bold">AR</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Alex Rivera</strong>
                    <span className="text-[11px] text-slate-500 block">Lead Architect</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-positive">Integration Ready</span>
                </div>
              </div>
            </article>

            {/* Card 3: Meeting Brief & Agenda */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Agenda & Objectives</span>
                  <h3 className="td-card-title">Tomorrow 10:00 AM Review</h3>
                </div>
                <CalendarDays size={16} className="text-blue-600" />
              </header>

              <div className="td-deck-card-body text-xs space-y-3">
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <strong className="text-blue-900 block mb-1">Key Objective:</strong>
                  <p className="text-slate-700 leading-relaxed">
                    Review annual product usage metrics, present the $120k contract renewal schedule, and confirm onboarding steps for 25 additional developer seats.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <strong className="text-slate-800 block mb-1">Agreed in Previous Sync:</strong>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Sarah confirmed satisfaction with current system uptime and support responsiveness.</li>
                    <li>Marcus requested the renewal invoice be sent 30 days before contract expiration.</li>
                    <li>Alex requested documentation on the new webhook APIs.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Card 4: Recent Communications Timeline */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Recent Communications</span>
                  <h3 className="td-card-title">Emails & Notes</h3>
                </div>
                <MessageSquare size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-2.5 text-xs">
                <div className="td-comm-entry">
                  <Mail size={13} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Yesterday at 4:00 PM • Email from Sarah Lin</span>
                    <p className="text-slate-800 font-medium">"Looking forward to tomorrow's 10 AM review. We have 3 quick questions regarding the renewal terms."</p>
                  </div>
                </div>

                <div className="td-comm-entry">
                  <MessageSquare size={13} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Yesterday at 1:30 PM • Slack from Marcus Vance</span>
                    <p className="text-slate-800 font-medium">"Finance approved the proposed renewal terms. Let's confirm final invoice numbers tomorrow."</p>
                  </div>
                </div>

                <div className="td-comm-entry">
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Today at 9:15 AM • Calendar RSVP</span>
                    <p className="text-slate-800 font-medium">Sarah Lin, Marcus Vance, and Alex Rivera confirmed attendance.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 5: Suggested Talking Points & Actions */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-blue-600" />
                  <div>
                    <span className="td-card-cat">Meeting Preparation</span>
                    <h3 className="td-card-title">Suggested Talking Points & One-Click Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-blue-700 bg-blue-100 font-semibold px-2.5 py-1 rounded-full">
                  Ready for Meeting
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <strong className="text-xs font-semibold text-slate-800 block mb-2">Recommended Talking Points:</strong>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Highlight annual adoption:</strong> Share adoption statistics (150 active seats, 94% weekly engagement) to reinforce ROI.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Review renewal terms:</strong> Walk Marcus through the straightforward $120k renewal breakdown and multi-year discount option.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Preview next quarter roadmap:</strong> Share the upcoming API enhancements requested by Alex Rivera.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">Execute Actions:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['send_briefing'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('send_briefing', 'Send Briefing to Sarah Lin', 'Meeting summary sent to s.lin@acme.com')}
                      >
                        <Mail size={13} />
                        <span>{appliedActions['send_briefing'] ? 'Briefing Sent' : 'Email Briefing to Sarah'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['lock_sla'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('lock_sla', 'Confirm Renewal Terms', 'Renewal agreement terms locked for tomorrow')}
                      >
                        <FileText size={13} />
                        <span>{appliedActions['lock_sla'] ? 'Terms Confirmed' : 'Confirm Renewal Terms'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['set_crit'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('set_crit', 'Set High Priority on Renewal Task', 'Priority updated to High')}
                      >
                        <Zap size={13} />
                        <span>{appliedActions['set_crit'] ? 'High Priority Set' : 'Flag High Priority'}</span>
                      </button>

                      <button
                        type="button"
                        className="td-action-chip"
                        onClick={() => onSwitchView && onSwitchView('calendar')}
                      >
                        <CalendarDays size={13} />
                        <span>View in Calendar</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4">
                    Actions update the workspace database and logs immediately.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Scenario 2: Usage Drop Investigation */}
      {activeScenario === 'usage_drop' && (
        <section className="td-adaptive-workspace-view animate-fade-in">
          <div className="td-intent-meta-card td-theme-danger">
            <div className="td-intent-meta-header">
              <div className="flex items-center gap-2">
                <span className="td-intent-pill td-pill-crit">Domain: Growth & Telemetry</span>
                <span className="td-intent-pill td-pill-crit">Urgency: High</span>
                <span className="td-intent-pill td-pill-conf">98% Intent Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Investigate 15% login drop in European region</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon text-red-600">
                <AlertTriangle size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  System telemetry detected a 15.2% drop in user logins across Europe on Tuesday at 2:00 PM. Surfaced regional metrics, traffic trend line, and gateway incident details for quick diagnosis.
                </p>
              </div>
            </div>
          </div>

          <div className="td-adaptive-grid">
            {/* Card 1: Anomaly Callout Alert */}
            <article className="td-deck-card td-col-span-12 bg-red-50/50 border-red-200">
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-950">Active Alert: 15.2% Login Drop in European Region</h3>
                    <p className="text-xs text-red-800">
                      European login events decreased from 1,650 to 1,400 following a gateway timeout on Tuesday at 2:00 PM. North America and Asia Pacific regions remain normal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                    Action Needed
                  </span>
                </div>
              </div>
            </article>

            {/* Card 2: Telemetry Line Stream (Solid Chart Visual, No Gradients) */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Telemetry Stream</span>
                  <h3 className="td-card-title">Daily European Logins (Past 5 Days)</h3>
                </div>
                <BarChart3 size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body">
                <div className="td-svg-chart-container py-3">
                  <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
                    <path
                      d="M 10 30 Q 80 28 150 32 T 220 38 T 290 85 T 380 88"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                    <circle cx="10" cy="30" r="3.5" fill="#ef4444" />
                    <circle cx="150" cy="32" r="3.5" fill="#ef4444" />
                    <circle cx="220" cy="38" r="3.5" fill="#ef4444" />
                    <circle cx="290" cy="85" r="5" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="380" cy="88" r="4" fill="#ef4444" />
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-1">
                    <span>Mon (1,650)</span>
                    <span>Tue (1,620)</span>
                    <span className="text-red-600 font-bold">Tue 2PM Timeout (1,400)</span>
                    <span>Wed (1,410)</span>
                    <span>Thu (1,400)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 mt-2">
                  <strong>Telemetry Signal:</strong> Normal baseline of ~1,650 logins dipped to 1,400 during the Tuesday gateway event and stabilized once the connection pool recovered.
                </div>
              </div>
            </article>

            {/* Card 3: Regional Breakdown Table */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Regional Breakdown</span>
                  <h3 className="td-card-title">User Activity by Region</h3>
                </div>
                <Layers size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2 font-semibold">Region</th>
                      <th className="pb-2 font-semibold">Active Users</th>
                      <th className="pb-2 font-semibold">Change</th>
                      <th className="pb-2 font-semibold">Uptime</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">North America</td>
                      <td className="py-2.5 text-slate-600">2,800</td>
                      <td className="py-2.5 font-semibold text-emerald-600">+2.4%</td>
                      <td className="py-2.5 text-slate-600">99.9%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">Normal</span></td>
                    </tr>
                    <tr className="bg-red-50/50">
                      <td className="py-2.5 font-bold text-red-900">Europe</td>
                      <td className="py-2.5 font-bold text-red-900">1,400</td>
                      <td className="py-2.5 font-bold text-red-600">-15.2%</td>
                      <td className="py-2.5 text-red-700">97.4%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">Attention</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Asia Pacific</td>
                      <td className="py-2.5 text-slate-600">900</td>
                      <td className="py-2.5 font-semibold text-emerald-600">+4.1%</td>
                      <td className="py-2.5 text-slate-600">99.8%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">Normal</span></td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                  <strong>Diagnostic Finding:</strong> North America and Asia Pacific are operating normally. The impact was confined strictly to European gateway traffic.
                </div>
              </div>
            </article>

            {/* Card 4: Diagnostic Actions & Root Cause */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-red-500" />
                  <div>
                    <span className="td-card-cat">Incident Management</span>
                    <h3 className="td-card-title">Root Cause and Diagnostic Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-red-700 bg-red-100 font-semibold px-2.5 py-1 rounded-full">
                  Status: Stabilized
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-xs text-slate-700 space-y-2">
                  <strong className="block text-slate-900 font-semibold">Root Cause Summary:</strong>
                  <p>
                    A gateway timeout occurred on the EU-West cluster at 2:00 PM on Tuesday due to connection pool saturation. SRE deployed a configuration patch at 4:30 PM, restoring latency to standard levels (&lt;85ms).
                  </p>
                  <p className="text-slate-500">
                    Next step: Confirm all European authentication instances are receiving traffic evenly.
                  </p>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">Available Actions:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['view_logs'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('view_logs', 'View European Server Logs', 'Opened EU-West gateway connection logs')}
                      >
                        <RefreshCw size={13} />
                        <span>{appliedActions['view_logs'] ? 'Logs Opened' : 'View Server Logs'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['status_update'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('status_update', 'Send Status Update to Team', 'Status notification published to incident channel')}
                      >
                        <Mail size={13} />
                        <span>{appliedActions['status_update'] ? 'Update Sent' : 'Send Status Update'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['create_incident'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('create_incident', 'Create Incident Report #104', 'Incident report created in Jira/Task tracker')}
                      >
                        <FileText size={13} />
                        <span>{appliedActions['create_incident'] ? 'Report Created' : 'Create Incident Report #104'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Scenario 3: Review Overdue Project Work */}
      {activeScenario === 'overdue_work' && (
        <section className="td-adaptive-workspace-view animate-fade-in">
          <div className="td-intent-meta-card td-theme-warning">
            <div className="td-intent-meta-header">
              <div className="flex items-center gap-2">
                <span className="td-intent-pill td-pill-crit">Domain: Project Delivery</span>
                <span className="td-intent-pill td-pill-crit">Urgency: High</span>
                <span className="td-intent-pill td-pill-conf">95% Intent Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Review 3 overdue sprint tasks and reassign blockers</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon text-amber-600">
                <AlertCircle size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  Current sprint records show 3 tasks overdue past their due dates and 1 task blocked waiting for security signoff. Surfaced overdue task table, team capacity, and one-click reassignment actions.
                </p>
              </div>
            </div>
          </div>

          <div className="td-adaptive-grid">
            {/* Card 1: Milestone Risk Banner */}
            <article className="td-deck-card td-col-span-12 bg-amber-50/50 border-amber-200">
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Clock3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">Sprint Status: 3 Overdue Deliverables Require Attention</h3>
                    <p className="text-xs text-amber-800">
                      Rebalancing assignments will unblock the team and keep the upcoming release milestone on schedule.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-amber-200 text-amber-900 rounded-full">
                    Action Needed
                  </span>
                </div>
              </div>
            </article>

            {/* Card 2: Overdue Deliverable Matrix */}
            <article className="td-deck-card td-col-span-8">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Task Matrix</span>
                  <h3 className="td-card-title">Overdue Sprint Deliverables</h3>
                </div>
                <AlertCircle size={16} className="text-red-500" />
              </header>

              <div className="td-deck-card-body">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2 font-semibold">Task Name</th>
                      <th className="pb-2 font-semibold">Assignee</th>
                      <th className="pb-2 font-semibold">Due Date</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Update API Documentation</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Alex Rivera</td>
                      <td className="py-2.5 text-red-600 font-bold">2 days ago</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">Overdue</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">High</span></td>
                    </tr>
                    <tr className="bg-amber-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Review Security Audit Checklist</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Sarah Lin</td>
                      <td className="py-2.5 text-amber-700 font-semibold">1 day ago</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">Blocked</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">High</span></td>
                    </tr>
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Finalize Mobile Release Notes</td>
                      <td className="py-2.5 text-slate-700 font-semibold">David Chen</td>
                      <td className="py-2.5 text-red-600 font-bold">3 days ago</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">Overdue</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">Medium</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">Prepare Sprint Demo Deck</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Sarah Lin</td>
                      <td className="py-2.5 text-amber-600 font-bold">Today 4:00 PM</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">In Progress</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">Medium</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Card 3: Team Capacity */}
            <article className="td-deck-card td-col-span-4">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Team Capacity</span>
                  <h3 className="td-card-title">Assignee Workload</h3>
                </div>
                <Users size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-3 text-xs">
                <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-red-950 font-semibold">Sarah Lin</strong>
                    <span className="text-[10px] text-red-700 font-bold">4 Tasks (Heavy Load)</span>
                  </div>
                  <p className="text-red-800 text-[11px]">
                    Waiting on external legal security review; demo deck due today.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-slate-900 font-semibold">Alex Rivera</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">2 Tasks (Available)</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Has open capacity to assist with documentation and release tasks.
                  </p>
                </div>
              </div>
            </article>

            {/* Card 4: Unblocking Actions */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-purple-600" />
                  <div>
                    <span className="td-card-cat">Workflow Unblocker</span>
                    <h3 className="td-card-title">Recommended Next Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-purple-700 bg-purple-100 font-semibold px-2.5 py-1 rounded-full">
                  Instant Resolution
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-xs text-slate-700 space-y-2">
                  <strong className="block text-slate-900 font-semibold">Recommended Unblocking Path:</strong>
                  <p>
                    Reassigning the demo deck preparation from Sarah Lin to Alex Rivera frees Sarah to conclude the security review, keeping the sprint delivery on track.
                  </p>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">Execute Actions:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['reassign_alex'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('reassign_alex', 'Reassign Task to Alex Rivera', 'Demo deck reassigned to Alex Rivera')}
                      >
                        <Users size={13} />
                        <span>{appliedActions['reassign_alex'] ? 'Reassigned to Alex Rivera' : 'Reassign to Alex Rivera'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['extend_deadline'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('extend_deadline', 'Extend Due Date by 2 Days', 'Due dates extended by 2 business days')}
                      >
                        <Clock3 size={13} />
                        <span>{appliedActions['extend_deadline'] ? 'Due Date Extended (+2 Days)' : 'Extend Due Date (+2 Days)'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['ping_slack'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('ping_slack', 'Send Reminder on Slack', 'Reminder notifications sent to task assignees')}
                      >
                        <MessageSquare size={13} />
                        <span>{appliedActions['ping_slack'] ? 'Reminder Sent on Slack' : 'Ping Owners on Slack'}</span>
                      </button>

                      <button
                        type="button"
                        className="td-action-chip"
                        onClick={() => onSwitchView && onSwitchView('board')}
                      >
                        <LayoutGrid size={13} />
                        <span>Open in Kanban Board</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Scenario 0: Generic Dashboard (Baseline) */}
      {activeScenario === 'generic' && (
        <section className="td-adaptive-workspace-view animate-fade-in">
          <div className="td-intent-meta-card">
            <div className="td-intent-meta-header">
              <div className="flex items-center gap-2">
                <span className="td-intent-pill td-pill-conf">Baseline Dashboard</span>
                <span className="td-intent-pill td-pill-sales">Generic Mode</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Standard Unadapted Workspace
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon">
                <Info size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Generic Dashboard Baseline:</strong>
                <p>
                  This is the standard, unspecialized view before an intent is declared. Notice how users must manually navigate menus, tables, and tabs to piece together context. Click any of the <strong>3 demo task buttons</strong> above to watch PRISM reorganize the workspace!
                </p>
              </div>
            </div>
          </div>

          <div className="td-adaptive-grid">
            <article className="td-deck-card td-col-span-3">
              <header className="td-deck-card-head"><span className="td-card-cat">Active ARR</span></header>
              <div className="td-deck-card-body"><p className="text-2xl font-bold text-slate-900">$3.85M</p><span className="text-xs text-emerald-600 font-semibold">+14.2% YoY</span></div>
            </article>

            <article className="td-deck-card td-col-span-3">
              <header className="td-deck-card-head"><span className="td-card-cat">Total Accounts</span></header>
              <div className="td-deck-card-body"><p className="text-2xl font-bold text-slate-900">640</p><span className="text-xs text-slate-500">Across 3 tiers</span></div>
            </article>

            <article className="td-deck-card td-col-span-3">
              <header className="td-deck-card-head"><span className="td-card-cat">Open Tasks</span></header>
              <div className="td-deck-card-body"><p className="text-2xl font-bold text-slate-900">14</p><span className="text-xs text-amber-600 font-semibold">3 Critical / 5 In Progress</span></div>
            </article>

            <article className="td-deck-card td-col-span-3">
              <header className="td-deck-card-head"><span className="td-card-cat">Active Agents</span></header>
              <div className="td-deck-card-body"><p className="text-2xl font-bold text-slate-900">3</p><span className="text-xs text-purple-600 font-semibold">Prism AI, Planner, Sentinel</span></div>
            </article>

            <article className="td-deck-card td-col-span-12">
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Sparkles size={24} className="mx-auto text-purple-600 mb-2" />
                <h3 className="font-semibold text-slate-800 text-sm">Ready to see PRISM in action?</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Select any of the 3 hackathon challenge tasks in the top bar to demonstrate the interface dynamically re-organizing itself around your goal.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                    onClick={() => setActiveScenario('meeting_prep')}
                  >
                    1. Try Client Meeting Prep
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
                    onClick={() => setActiveScenario('usage_drop')}
                  >
                    2. Try Usage Drop Diagnostic
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
                    onClick={() => setActiveScenario('overdue_work')}
                  >
                    3. Try Overdue Project Work
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}
    </div>
  );
};
