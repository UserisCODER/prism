import React from 'react';
import { motion } from 'framer-motion';
import { Pin, HelpCircle } from 'lucide-react';
import type { PanelPlan } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

// Import all 22 registry component panels
import { ClientOverviewPanel } from './ClientOverviewPanel';
import { KpiRowPanel } from './KpiRowPanel';
import { UsageTrendChart } from './UsageTrendChart';
import { AutonomousLogPanel } from './AutonomousLogPanel';
import { AnomalyCalloutPanel } from './AnomalyCalloutPanel';
import { DeadlineBannerPanel } from './DeadlineBannerPanel';
import { OverdueTaskListPanel } from './OverdueTaskListPanel';
import { RecentCommunicationsPanel } from './RecentCommunicationsPanel';
import { TalkingPointsPanel } from './TalkingPointsPanel';
import { RiskMatrixPanel } from './RiskMatrixPanel';
import { InsightCardPanel } from './InsightCardPanel';
import { SegmentUsageTablePanel } from './SegmentUsageTablePanel';
import { ProjectHealthPanel } from './ProjectHealthPanel';
import { ContactCardPanel } from './ContactCardPanel';
import { MeetingBriefPanel } from './MeetingBriefPanel';
import { SuggestedActionsPanel } from './SuggestedActionsPanel';
import { PrListPanel } from './PrListPanel';
import { FailingTestsPanel } from './FailingTestsPanel';
import { DeployStatusPanel } from './DeployStatusPanel';
import { IssueTrackerPanel } from './IssueTrackerPanel';
import { NotionPagesPanel } from './NotionPagesPanel';
import { NotionTasksPanel } from './NotionTasksPanel';

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  client_overview: ClientOverviewPanel,
  meeting_prep_brief: MeetingBriefPanel,
  meeting_brief: MeetingBriefPanel,
  kpi_row: KpiRowPanel,
  trend_chart: UsageTrendChart,
  segment_breakdown: SegmentUsageTablePanel,
  anomaly_callout: AnomalyCalloutPanel,
  deadline_banner: DeadlineBannerPanel,
  task_list: OverdueTaskListPanel,
  recent_communications: RecentCommunicationsPanel,
  talking_points: TalkingPointsPanel,
  risk_matrix: RiskMatrixPanel,
  insight_card: InsightCardPanel,
  segment_usage_table: SegmentUsageTablePanel,
  project_health_card: ProjectHealthPanel,
  project_status: ProjectHealthPanel,
  contact_card: ContactCardPanel,
  autonomous_log: AutonomousLogPanel,
  suggested_actions: SuggestedActionsPanel,
  pr_list: PrListPanel,
  failing_tests: FailingTestsPanel,
  deploy_status: DeployStatusPanel,
  issue_tracker: IssueTrackerPanel,
  code_suggestions: SuggestedActionsPanel,
  notion_pages: NotionPagesPanel,
  notion_tasks: NotionTasksPanel,
  notion_activity: NotionPagesPanel,
};

const UnknownPanel: React.FC<{ componentId: string }> = ({ componentId }) => (
  <div className="rounded-2xl border border-rose-300/20 bg-rose-950/20 p-5 text-sm text-rose-100">
    This workspace panel is not available: <code>{componentId}</code>
  </div>
);

export const RegistryContainer: React.FC<{ panel: PanelPlan }> = ({ panel }) => {
  const { togglePinPanel, openExplainModal, pinnedIds } = useWorkspace();
  const ComponentClass = COMPONENT_MAP[panel.component_id];
  const isPinned = pinnedIds.includes(panel.instanceId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 28, transition: { duration: 0.3, ease: 'easeOut' } }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      exit={{ opacity: 0, x: -28, transition: { duration: 0.3, ease: 'easeIn' } }}
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
      className="prism-panel group relative"
    >
      {/* Panel Top-Right Floating Controls (Pin & Explain) */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        
        <button
          onClick={() => openExplainModal(panel)}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#121623]/90 px-2.5 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-md hover:bg-indigo-600/30 hover:text-white transition-all shadow-lg"
          title="Why am I seeing this panel?"
        >
          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
          <span>Why?</span>
        </button>

        <button
          onClick={() => togglePinPanel(panel.instanceId)}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-mono backdrop-blur-md transition-all shadow-lg ${
            isPinned
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-white/10 bg-[#121623]/90 text-slate-300 hover:bg-indigo-600/30 hover:text-white'
          }`}
          title={isPinned ? 'Unpin panel' : 'Pin panel to keep across re-layouts'}
        >
          <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
          <span>{isPinned ? 'Pinned' : 'Pin'}</span>
        </button>
      </div>

      {/* Pinned Badge if Pinned */}
      {isPinned && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
          <Pin className="h-3 w-3 fill-current" />
          <span>USER PINNED</span>
        </div>
      )}

      {/* Render Widget */}
      {ComponentClass ? <ComponentClass /> : <UnknownPanel componentId={panel.component_id} />}
    </motion.div>
  );
};
