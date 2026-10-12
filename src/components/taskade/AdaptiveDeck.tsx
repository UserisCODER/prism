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
    showToast(`✓ Applied: ${label}`);
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
              <span className="td-adaptive-live-tag">Hackathon Demo Mode</span>
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
                <span className="td-intent-pill td-pill-sales">Domain: Enterprise Sales & Retention</span>
                <span className="td-intent-pill td-pill-high">Urgency: HIGH</span>
                <span className="td-intent-pill td-pill-conf">96% Intent Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Prepare tomorrow's client meeting with Meridian Labs / Acme Enterprise</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon">
                <Info size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  Correlated calendar invite <em>"Meridian Labs / Acme Quarterly Architecture & SLA Sync"</em> (Tomorrow at 11:30 AM) with recent <strong>+34% token throughput spike</strong> and contract renegotiation threshold. Automatically surfaced client health ($1.42M ARR), VP Engineering stakeholder sentiment, telemetry spikes, prior decisions, and executive talking points.
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
                  <span className="td-card-cat">Client Overview & Context</span>
                  <h3 className="td-card-title">Meridian Labs / Acme Enterprise</h3>
                </div>
                <span className="td-health-badge td-badge-at-risk">68 / 100 Health Score (At Risk)</span>
              </header>

              <div className="td-deck-card-body">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Contract ARR</span>
                    <p className="text-lg font-bold text-slate-900">$1.42M</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Industry</span>
                    <p className="text-sm font-semibold text-slate-800">Financial SaaS</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Account Owner</span>
                    <p className="text-sm font-semibold text-slate-800">Priya Sharma</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Renewal Date</span>
                    <p className="text-sm font-semibold text-slate-800">Next Month (Q3)</p>
                  </div>
                </div>

                <div className="td-client-notes p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 leading-relaxed">
                  <strong>Account Alert:</strong> Token throughput increased +34% this week. Contract renegotiation threshold triggered. Stakeholders have requested customized SLA tier pricing and revision to MSA compliance clause 4.2.
                </div>
              </div>
            </article>

            {/* Card 2: Key Stakeholders & Sentiment */}
            <article className="td-deck-card td-col-span-4">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Stakeholder Profiles</span>
                  <h3 className="td-card-title">Meeting Attendees & Sentiment</h3>
                </div>
                <Users size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-3">
                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-purple-100 text-purple-700 font-bold">SJ</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Sarah Jenkins</strong>
                    <span className="text-[11px] text-slate-500 block">VP of Engineering</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-at-risk">At Risk (SLA)</span>
                </div>

                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-blue-100 text-blue-700 font-bold">MV</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Marcus Vance</strong>
                    <span className="text-[11px] text-slate-500 block">Head of Growth</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-negative">Budget Pushback</span>
                </div>

                <div className="td-stakeholder-item">
                  <div className="td-st-avatar bg-emerald-100 text-emerald-700 font-bold">ER</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs text-slate-900 block truncate">Elena Rostova</strong>
                    <span className="text-[11px] text-slate-500 block">Lead System Architect</span>
                  </div>
                  <span className="td-sentiment-pill td-sent-positive">Positive (Speed)</span>
                </div>
              </div>
            </article>

            {/* Card 3: Meeting Brief & Previous Meeting */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Calendar Invite & Agenda</span>
                  <h3 className="td-card-title">Tomorrow 11:30 AM Executive Sync</h3>
                </div>
                <CalendarDays size={16} className="text-purple-600" />
              </header>

              <div className="td-deck-card-body text-xs space-y-3">
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                  <strong className="text-purple-900 block mb-1">Key Objective:</strong>
                  <p className="text-slate-700 leading-relaxed">
                    Review Q3 contract amendment, review MSA clause 4.2 compliance wording, and agree on tier-4 SLA pricing.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <strong className="text-slate-800 block mb-1">Decisions From Previous Sync:</strong>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Agreed that 99.98% uptime SLA can be guaranteed with dedicated multi-region cluster.</li>
                    <li>Sarah requested compliance clause 4.2 be updated before legal sign-off.</li>
                    <li>Agreed to present updated proposal at tomorrow's sync.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Card 4: Recent Communications Timeline */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Recent Communications</span>
                  <h3 className="td-card-title">Slack & Email Signal Timeline</h3>
                </div>
                <MessageSquare size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-2.5 text-xs">
                <div className="td-comm-entry">
                  <Mail size={13} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Yesterday at 4:15 PM • Email from Sarah Jenkins</span>
                    <p className="text-slate-800 font-medium">"Could your team share the updated SLA clause 4.2 draft prior to tomorrow's 11:30 sync?"</p>
                  </div>
                </div>

                <div className="td-comm-entry">
                  <MessageSquare size={13} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Yesterday at 2:00 PM • Slack from Marcus Vance</span>
                    <p className="text-slate-800 font-medium">"We have budget approval for Q4 expansion if pricing accommodates the 34% volume jump."</p>
                  </div>
                </div>

                <div className="td-comm-entry">
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px]">Today at 10:30 AM • Calendar RSVP</span>
                    <p className="text-slate-800 font-medium">Elena Rostova & Sarah Jenkins accepted meeting invitation.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 5: Suggested Talking Points & Actions */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <div>
                    <span className="td-card-cat">Actionable Intelligence</span>
                    <h3 className="td-card-title">Suggested Talking Points & One-Click Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-amber-700 bg-amber-100 font-semibold px-2.5 py-1 rounded-full">
                  Ready for Meeting
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <strong className="text-xs font-semibold text-slate-800 block mb-2">Recommended Talking Points:</strong>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Acknowledge SLA latency upfront:</strong> Reassure Sarah by showcasing 99.98% cluster uptime and dedicated failover routes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Address custom pricing threshold:</strong> Offer Marcus tiered volume pricing for the +34% throughput to lock the $1.42M renewal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Confirm legal clause 4.2:</strong> Hand over the revised MSA compliance clause ready for sign-off.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">Execute Real-Time Actions:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['send_briefing'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('send_briefing', 'Send Briefing to Sarah Jenkins', 'Briefing deck emailed to s.jenkins@meridianlabs.io')}
                      >
                        <Mail size={13} />
                        <span>{appliedActions['send_briefing'] ? '✓ Briefing Sent' : 'Email Briefing to Sarah'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['lock_sla'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('lock_sla', 'Lock MSA Clause 4.2 Draft', 'Clause 4.2 marked as approved in contract repository')}
                      >
                        <FileText size={13} />
                        <span>{appliedActions['lock_sla'] ? '✓ Clause 4.2 Locked' : 'Lock SLA Clause 4.2'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['set_crit'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('set_crit', 'Set Critical Priority on Acme Contract', 'Priority elevated to CRITICAL')}
                      >
                        <Zap size={13} />
                        <span>{appliedActions['set_crit'] ? '✓ Set Critical' : 'Set Critical Priority'}</span>
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
                    Every action updates the active workspace database and logs explainability traces live.
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
                <span className="td-intent-pill td-pill-crit">Domain: Growth & System Telemetry</span>
                <span className="td-intent-pill td-pill-crit">Urgency: CRITICAL</span>
                <span className="td-intent-pill td-pill-conf">98% Intent Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Investigate -34% usage drop across SMB segment in Week 38</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon text-red-600">
                <AlertTriangle size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  Automatic anomaly daemon detected sudden <strong>-34.2% drop in active SMB events</strong> between Thursday and Saturday of Week 38. Surfaced anomaly alert callout, telemetry spline chart comparing cohorts, segment breakdown table, and root-cause signal trace (Gateway Node #491 batch rate limit escalation).
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
                    <h3 className="text-sm font-bold text-red-950">Statistically Significant Anomaly Detected: -34.2% Drop</h3>
                    <p className="text-xs text-red-800">
                      480 SMB customer sub-accounts experienced sudden API batch throttles during Week 38. Enterprise cohort remained healthy (+12.4%).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                    SLA Risk Threshold Breached
                  </span>
                </div>
              </div>
            </article>

            {/* Card 2: Telemetry Spline Stream (Chart Visual) */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Telemetry Stream</span>
                  <h3 className="td-card-title">Daily Inference Events (Week 38)</h3>
                </div>
                <BarChart3 size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body">
                {/* SVG Spline Trend Visualization */}
                <div className="td-svg-chart-container py-3">
                  <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
                    <defs>
                      <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 30 Q 80 25 150 35 T 220 40 T 290 95 T 380 100"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 10 30 Q 80 25 150 35 T 220 40 T 290 95 T 380 100 L 380 120 L 10 120 Z"
                      fill="url(#dropGrad)"
                    />
                    {/* Data Points */}
                    <circle cx="10" cy="30" r="3.5" fill="#ef4444" />
                    <circle cx="150" cy="35" r="3.5" fill="#ef4444" />
                    <circle cx="220" cy="40" r="3.5" fill="#ef4444" />
                    <circle cx="290" cy="95" r="5" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="380" cy="100" r="4" fill="#ef4444" />
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-1">
                    <span>Mon (182k)</span>
                    <span>Tue (178k)</span>
                    <span>Wed (175k)</span>
                    <span>Thu (168k)</span>
                    <span className="text-red-600 font-bold">Fri (-34% drop: 118k)</span>
                    <span>Sat (112k)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 mt-2">
                  <strong>Chart Signal:</strong> Normal baseline of ~180k events dropped precipitously to 118k starting Thursday 18:00 UTC following Gateway Node #491 upgrade.
                </div>
              </div>
            </article>

            {/* Card 3: Segment Breakdown Table */}
            <article className="td-deck-card td-col-span-6">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Segment Cohorts</span>
                  <h3 className="td-card-title">Customer Segment Performance</h3>
                </div>
                <Layers size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2 font-semibold">Segment</th>
                      <th className="pb-2 font-semibold">Accounts</th>
                      <th className="pb-2 font-semibold">MoM Delta</th>
                      <th className="pb-2 font-semibold">Uptime</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Enterprise</td>
                      <td className="py-2.5 text-slate-600">42</td>
                      <td className="py-2.5 font-semibold text-emerald-600">+12.4%</td>
                      <td className="py-2.5 text-slate-600">99.95%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">Healthy</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Mid-Market</td>
                      <td className="py-2.5 text-slate-600">118</td>
                      <td className="py-2.5 font-semibold text-slate-600">-3.8%</td>
                      <td className="py-2.5 text-slate-600">99.40%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">Normal</span></td>
                    </tr>
                    <tr className="bg-red-50/50">
                      <td className="py-2.5 font-bold text-red-900">SMB Cluster</td>
                      <td className="py-2.5 font-bold text-red-900">480</td>
                      <td className="py-2.5 font-bold text-red-600">-34.2%</td>
                      <td className="py-2.5 text-red-700">94.10%</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">ANOMALY</span></td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                  <strong>Hypothesis Confirmed:</strong> Enterprise dedicated clusters were untouched; drop is isolated strictly to the shared SMB ingress router.
                </div>
              </div>
            </article>

            {/* Card 4: Diagnostic Actions & Root Cause Resolution */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-red-500" />
                  <div>
                    <span className="td-card-cat">Remediation Engine</span>
                    <h3 className="td-card-title">Root-Cause Resolution & Diagnostic Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-red-700 bg-red-100 font-semibold px-2.5 py-1 rounded-full">
                  Immediate Remediation
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-xs text-slate-700 space-y-2">
                  <strong className="block text-slate-900 font-semibold">Root Cause Trace:</strong>
                  <p>
                    <strong>Gateway Node #491</strong> triggered a hard token throttle limit on batch requests without retries. Upstream client SDK v2.4 failed silently without back-off, leading to 504 errors for SMB accounts.
                  </p>
                  <p className="text-slate-500">
                    Fix identified: Roll back gateway throttling configuration to v2.3 defaults and deploy retry handler.
                  </p>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">One-Click Remediation:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['rollback_throttling'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('rollback_throttling', 'Rollback Gateway Node #491 Throttling', 'Throttling limit increased +300% on Gateway #491')}
                      >
                        <RefreshCw size={13} />
                        <span>{appliedActions['rollback_throttling'] ? '✓ Rollback Deployed' : 'Rollback Gateway #491 Throttling'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['notify_accounts'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('notify_accounts', 'Notify 480 Affected SMB Accounts', 'In-app notice broadcasted re: resolved connectivity')}
                      >
                        <Mail size={13} />
                        <span>{appliedActions['notify_accounts'] ? '✓ Accounts Notified' : 'Notify Affected Accounts'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['file_postmortem'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('file_postmortem', 'Generate Post-Mortem Incident #842', 'Post-mortem drafted in Incident Tracker')}
                      >
                        <FileText size={13} />
                        <span>{appliedActions['file_postmortem'] ? '✓ Incident #842 Filed' : 'Create Incident Report #842'}</span>
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
                <span className="td-intent-pill td-pill-crit">Domain: Project Delivery & SLA</span>
                <span className="td-intent-pill td-pill-crit">Urgency: CRITICAL</span>
                <span className="td-intent-pill td-pill-conf">95% Intent Confidence</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Goal: <strong>Review 5 overdue project deliverables and critical blockers</strong>
              </div>
            </div>

            <div className="td-explainability-box">
              <div className="td-explain-icon text-amber-600">
                <AlertCircle size={15} />
              </div>
              <div className="td-explain-text">
                <strong>Why this interface was surfaced:</strong>
                <p>
                  Compiled from active project database records: <strong>3 tasks crossed critical SLA deadlines</strong> and <strong>2 dependencies are currently marked as blocked</strong>, endangering the Q3 Milestone Delivery commitment. Surfaced overdue task matrix, owner bottleneck heatmap, and rapid unblocking actions.
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
                    <h3 className="text-sm font-bold text-amber-950">Q3 Milestone Commitment At Risk: 5 Overdue / Blocked Deliverables</h3>
                    <p className="text-xs text-amber-800">
                      Deliverable delays directly block client contract renewal sign-offs for Meridian Labs and Project Apex rollout.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-amber-200 text-amber-900 rounded-full">
                    Action Required
                  </span>
                </div>
              </div>
            </article>

            {/* Card 2: Overdue Deliverable Matrix */}
            <article className="td-deck-card td-col-span-8">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Deliverable Matrix</span>
                  <h3 className="td-card-title">Critical Overdue Deliverables</h3>
                </div>
                <AlertCircle size={16} className="text-red-500" />
              </header>

              <div className="td-deck-card-body">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2 font-semibold">Deliverable</th>
                      <th className="pb-2 font-semibold">Owner</th>
                      <th className="pb-2 font-semibold">Due Date</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Finalize Q3 contract amendment for Acme / Meridian</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Priya Sharma</td>
                      <td className="py-2.5 text-red-600 font-bold">Yesterday</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">OVERDUE</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">CRITICAL</span></td>
                    </tr>
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Audit telemetry latency drop across SMB nodes</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Marcus Vance</td>
                      <td className="py-2.5 text-red-600 font-bold">3 days ago</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">OVERDUE</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">CRITICAL</span></td>
                    </tr>
                    <tr className="bg-amber-50/30">
                      <td className="py-2.5 font-medium text-slate-900">Resolve API rate limit escalation for batch run #491</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Ana Martinez</td>
                      <td className="py-2.5 text-amber-700 font-semibold">2 days ago</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">BLOCKED</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">HIGH</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">Draft executive briefing deck for 11:30 AM sync</td>
                      <td className="py-2.5 text-slate-700 font-semibold">Priya Sharma</td>
                      <td className="py-2.5 text-amber-600 font-bold">Today 11:00 AM</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">DUE TODAY</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 font-semibold">HIGH</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Card 3: Bottleneck & Owner Capacity */}
            <article className="td-deck-card td-col-span-4">
              <header className="td-deck-card-head">
                <div>
                  <span className="td-card-cat">Resource Workload</span>
                  <h3 className="td-card-title">Owner Bottlenecks</h3>
                </div>
                <Users size={16} className="text-slate-400" />
              </header>

              <div className="td-deck-card-body space-y-3 text-xs">
                <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-red-950 font-semibold">Priya Sharma</strong>
                    <span className="text-[10px] text-red-700 font-bold">140% Capacity (Overloaded)</span>
                  </div>
                  <p className="text-red-800 text-[11px]">
                    Assigned 2 critical overdue items simultaneously. Reassign task #t-104 to unlock execution.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-slate-900 font-semibold">Ana Martinez</strong>
                    <span className="text-[10px] text-amber-700 font-semibold">Blocked by Gateway SRE</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Waiting on Gateway Node #491 throttle rollback to verify fix.
                  </p>
                </div>
              </div>
            </article>

            {/* Card 4: Rapid Unblocking Actions */}
            <article className="td-deck-card td-col-span-12 td-highlight-card">
              <header className="td-deck-card-head">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-purple-600" />
                  <div>
                    <span className="td-card-cat">Project Momentum Engine</span>
                    <h3 className="td-card-title">One-Click Unblocking Actions</h3>
                  </div>
                </div>
                <span className="text-xs text-purple-700 bg-purple-100 font-semibold px-2.5 py-1 rounded-full">
                  Instant Recovery
                </span>
              </header>

              <div className="td-deck-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-xs text-slate-700 space-y-2">
                  <strong className="block text-slate-900 font-semibold">Recommended Unblocking Path:</strong>
                  <p>
                    Reassigning the executive briefing deck from Priya Sharma to Alex Chen frees up Priya to finalize the Acme contract amendment before tomorrow's 11:30 AM client sync.
                  </p>
                </div>

                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <strong className="text-xs font-semibold text-slate-800 block mb-2">Execute Rapid Unblocking:</strong>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['reassign_sre'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('reassign_sre', 'Reassign Blocker to SRE Team', 'Task #t-103 reassigned to SRE Escalation Team')}
                      >
                        <Users size={13} />
                        <span>{appliedActions['reassign_sre'] ? '✓ Reassigned to SRE' : 'Reassign Blocker to SRE'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['extend_48h'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('extend_48h', 'Extend Milestone Deadline +48h', 'SLA deadline extended by 48 hours')}
                      >
                        <Clock3 size={13} />
                        <span>{appliedActions['extend_48h'] ? '✓ Deadline Extended +48h' : 'Extend Deadline +48h'}</span>
                      </button>

                      <button
                        type="button"
                        className={`td-action-chip ${appliedActions['slack_owners'] ? 'is-applied' : ''}`}
                        onClick={() => handleActionClick('slack_owners', 'Ping Task Assignees on Slack', 'Slack alert sent to Priya Sharma & Marcus Vance')}
                      >
                        <MessageSquare size={13} />
                        <span>{appliedActions['slack_owners'] ? '✓ Slack Alert Sent' : 'Ping Owners on Slack'}</span>
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
