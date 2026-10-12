import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  GitBranch,
  Layers,
  LayoutGrid,
  List,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings2,
  Share2,
  ShieldAlert,
  Sparkles,
  Table2,
  Tag,
  Trash2,
  TrendingDown,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import {
  AgentActionOption,
  AgentActionPayload,
  createTaskadeAgent,
  createTaskadeNode,
  createTaskadeWorkflow,
  deleteTaskadeNode,
  fetchTaskadeWorkspace,
  fetchTaskadeWorkspaces,
  sendTaskadeAgentMessage,
  TaskadeAgentRecord,
  TaskadeModelTier,
  TaskadeNodeRecord,
  TaskadePriority,
  TaskadeProjectRecord,
  TaskadeStatus,
  TaskadeWorkflowRecord,
  TaskadeWorkspaceRecord,
  updateTaskadeNode,
  updateTaskadeWorkflow,
} from '../../services/taskadeApi';
import './TaskadeWorkspace.css';
import { TaskDetailInspector } from './TaskDetailInspector';
import { AdaptiveDeck, AdaptiveScenarioId } from './AdaptiveDeck';

type MainSection = 'apps' | 'agents' | 'workflows';
type ProjectView = 'list' | 'board' | 'mindmap' | 'table' | 'calendar' | 'adaptive';
type TaskStatus = TaskadeStatus;
type TaskPriority = TaskadePriority;

interface TaskItem {
  id: string;
  title: string;
  content: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
}

interface AgentProfile {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  persona: string;
  systemPrompt: string;
  tier: TaskadeModelTier;
  initials: string;
  color: string;
  skills: string[];
}

interface WorkflowDefinition {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  lastRun: string;
  active?: boolean;
  initialActive?: boolean;
  triggerType?: TaskadeWorkflowRecord['trigger_type'];
  triggerConfig?: Record<string, unknown>;
  nodes?: TaskadeWorkflowRecord['nodes'];
  edges?: TaskadeWorkflowRecord['edges'];
  isFallback?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionTaken?: string;
  options?: AgentActionOption[];
}

interface TaskadeWorkspaceProps {
  onOpenAdaptiveCanvas: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'In review',
  done: 'Done',
};

const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

const viewOptions: { id: ProjectView; label: string; icon: typeof List }[] = [
  { id: 'adaptive', label: 'Adaptive Deck', icon: Sparkles },
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'mindmap', label: 'Mind map', icon: GitBranch },
  { id: 'list', label: 'List', icon: List },
];

function formatDueDate(value?: string | null): string {
  if (!value) return 'No date';
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return value;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (dueDate.toDateString() === today.toDateString()) return 'Today';
  if (dueDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toTaskItem(node: TaskadeNodeRecord): TaskItem {
  return {
    id: node.id,
    title: node.title,
    content: node.content ?? '',
    status: node.status,
    priority: node.priority,
    assignee: node.assignee || 'Unassigned',
    dueDate: formatDueDate(node.due_date),
    tags: node.tags ?? [],
  };
}

function toAgentProfile(agent: TaskadeAgentRecord): AgentProfile {
  const nameParts = agent.name.trim().split(/\s+/);
  const palette = ['lavender', 'mint', 'peach'];
  return {
    id: agent.id,
    workspaceId: agent.workspace_id,
    name: agent.name,
    description: agent.persona,
    persona: agent.persona,
    systemPrompt: agent.system_prompt,
    tier: agent.model_tier,
    initials: nameParts.slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    color: palette[agent.name.length % palette.length],
    skills: agent.tools_assigned ?? [],
  };
}

function toWorkflowDefinition(workflow: TaskadeWorkflowRecord): WorkflowDefinition {
  const nodeList = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const steps = nodeList.map((node) => node.label).filter(Boolean);
  const triggerLabels: Record<TaskadeWorkflowRecord['trigger_type'], string> = {
    schedule: 'On a schedule',
    webhook: 'On a webhook',
    item_change: 'When a task is updated',
    manual: 'Run manually',
  };
  return {
    id: workflow.id,
    workspaceId: workflow.workspace_id,
    name: workflow.name,
    description: workflow.description ?? '',
    trigger: triggerLabels[workflow.trigger_type],
    steps,
    lastRun: 'Not run yet',
    active: workflow.is_active,
    triggerType: workflow.trigger_type,
    triggerConfig: workflow.trigger_config ?? {},
    nodes: nodeList,
    edges: workflow.edges ?? [],
  };
}

const TaskadeLogo: React.FC = () => (
  <span className="td-brand-mark" aria-hidden="true">
    <svg viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="prism-facet" x1="4" y1="3" x2="16" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0e9ff" />
          <stop offset=".48" stopColor="#a997ff" />
          <stop offset="1" stopColor="#6d58d7" />
        </linearGradient>
      </defs>
      <path d="M10 2.5 17 15.8H3L10 2.5Z" fill="url(#prism-facet)" />
      <path d="m10 2.5 1.2 13.3M3 15.8 8.1 8.1h3.8l5.1 7.7" stroke="#fff" strokeOpacity=".72" strokeWidth=".8" />
      <path d="m15.9 2 .45 1.25L17.6 3.7l-1.25.45-.45 1.25-.45-1.25-1.25-.45 1.25-.45L15.9 2Z" fill="#fff" />
    </svg>
  </span>
);

export const TaskadeWorkspace: React.FC<TaskadeWorkspaceProps> = ({ onOpenAdaptiveCanvas }) => {
  const [section, setSection] = useState<MainSection>('apps');
  const [view, setView] = useState<ProjectView>('adaptive');
  const [activeScenario, setActiveScenario] = useState<AdaptiveScenarioId>('meeting_prep');
  const [drawerMode, setDrawerMode] = useState<'docked' | 'floating'>('docked');
  const [workspaceList, setWorkspaceList] = useState<TaskadeWorkspaceRecord[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<TaskadeWorkspaceRecord | null>(null);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [projectList, setProjectList] = useState<TaskadeProjectRecord[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [agentList, setAgentList] = useState<AgentProfile[]>([]);
  const [workflowList, setWorkflowList] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [focusedCell, setFocusedCell] = useState<{ taskId: string; field: string } | null>(null);
  const activeProject = projectList.find((project) => project.id === activeProjectId) ?? null;
  const activeWorkflows = Object.fromEntries(workflowList.map((workflow) => [workflow.id, workflow.active ?? false]));

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) =>
      [task.title, task.content, task.assignee, ...task.tags].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, tasks]);

  const applyWorkspaceBundle = (bundle: Awaited<ReturnType<typeof fetchTaskadeWorkspace>>) => {
    const projects = bundle.projects;
    const selectedProject = projects[0] ?? null;
    setActiveWorkspace(bundle.workspace);
    setProjectList(projects);
    setActiveProjectId(selectedProject?.id ?? null);
    setTasks(selectedProject?.nodes.map(toTaskItem) ?? []);
    setAgentList(bundle.agents.map(toAgentProfile));
    setWorkflowList(bundle.workflows.map(toWorkflowDefinition));
    setIsFallback(bundle.isFallback);
  };

  useEffect(() => {
    let cancelled = false;

    const loadWorkspaceData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const workspaces = await fetchTaskadeWorkspaces();
        if (workspaces.length === 0) {
          throw new Error('The backend returned no workspaces.');
        }

        const selectedWorkspace =
          workspaces.find((workspace) =>
            `${workspace.slug ?? ''} ${workspace.domain ?? ''} ${workspace.name}`.toLowerCase().match(/sales|crm/)
          ) ?? workspaces[0];
        const bundle = await fetchTaskadeWorkspace(selectedWorkspace.id);

        if (!cancelled) {
          setWorkspaceList(workspaces);
          applyWorkspaceBundle(bundle);
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Could not load workspace data.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadWorkspaceData();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectWorkspace = async (workspace: TaskadeWorkspaceRecord) => {
    setWorkspaceMenuOpen(false);
    setIsLoading(true);
    setApiError(null);
    try {
      const bundle = await fetchTaskadeWorkspace(workspace.id);
      setWorkspaceList((current) => {
        if (current.some((item) => item.id === bundle.workspace.id)) return current;
        return [...current, bundle.workspace];
      });
      applyWorkspaceBundle(bundle);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load this workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = (project: TaskadeProjectRecord) => {
    setActiveProjectId(project.id);
    setTasks(project.nodes.map(toTaskItem));
    setView(project.default_view);
    setMobileNavOpen(false);
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setIsSaving(true);
    setApiError(null);
    try {
      const saved = await updateTaskadeNode(taskId, {
        status: task.status === 'done' ? 'todo' : 'done',
      });
      const updatedTask = toTaskItem(saved);
      setTasks((current) => current.map((item) => item.id === taskId ? updatedTask : item));
      setProjectList((current) => current.map((project) => project.id === saved.project_id
        ? { ...project, nodes: project.nodes.map((node) => node.id === taskId ? saved : node) }
        : project));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update this task.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskField = async (taskId: string, field: keyof TaskItem, value: any) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setIsSaving(true);
    setApiError(null);
    try {
      const apiField = field === 'dueDate' ? 'due_date' : field;
      const saved = await updateTaskadeNode(taskId, {
        [apiField]: value,
      });
      const updatedTask = toTaskItem(saved);
      setTasks((current) => current.map((item) => item.id === taskId ? updatedTask : item));
      setProjectList((current) => current.map((project) => project.id === saved.project_id
        ? { ...project, nodes: project.nodes.map((node) => node.id === taskId ? saved : node) }
        : project));
      setSelectedTask((current) => (current?.id === taskId ? updatedTask : current));
      setFocusedCell({ taskId, field: String(field) });
      setTimeout(() => setFocusedCell(null), 2500);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update task field.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setIsSaving(true);
    setApiError(null);
    try {
      await deleteTaskadeNode(taskId);
      setTasks((current) => current.filter((item) => item.id !== taskId));
      setProjectList((current) => current.map((project) => ({
        ...project,
        nodes: project.nodes.filter((node) => node.id !== taskId),
      })));
      setSelectedTask((current) => (current?.id === taskId ? null : current));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not delete this task.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    if (!activeProjectId) {
      setApiError('This workspace has no project to save tasks into.');
      return;
    }
    setIsSaving(true);
    setApiError(null);
    try {
      const saved = await createTaskadeNode({
        project_id: activeProjectId,
        title,
        content: '',
        status: 'todo',
        priority: 'medium',
        order_index: tasks.length,
        assignee: 'You',
        tags: [],
      });
      const item = toTaskItem(saved);
      setTasks((current) => [item, ...current]);
      setProjectList((current) => current.map((project) => project.id === saved.project_id
        ? { ...project, nodes: [saved, ...project.nodes] }
        : project));
      setNewTaskTitle('');
      setShowTaskForm(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save this task.');
    } finally {
      setIsSaving(false);
    }
  };

  const addAgent = async (agent: Omit<AgentProfile, 'id' | 'initials' | 'color'>) => {
    if (!activeWorkspace) {
      setApiError('Select a workspace before creating an agent.');
      return;
    }
    setIsSaving(true);
    setApiError(null);
    try {
      const saved = await createTaskadeAgent({
        workspace_id: activeWorkspace.id,
        name: agent.name,
        persona: agent.persona,
        system_prompt: agent.systemPrompt,
        model_tier: agent.tier,
        tools_assigned: agent.skills,
      });
      setAgentList((current) => [...current, toAgentProfile(saved)]);
      setShowAgentBuilder(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save this agent.');
    } finally {
      setIsSaving(false);
    }
  };

  const addWorkflow = async (workflow: Omit<WorkflowDefinition, 'id' | 'lastRun' | 'initialActive'>) => {
    if (!activeWorkspace) {
      setApiError('Select a workspace before creating a workflow.');
      return;
    }
    setIsSaving(true);
    setApiError(null);
    try {
      const saved = await createTaskadeWorkflow({
        workspace_id: activeWorkspace.id,
        name: workflow.name,
        description: workflow.description,
        trigger_type: workflow.triggerType ?? 'manual',
        trigger_config: workflow.triggerConfig ?? {},
        nodes: workflow.nodes ?? [],
        edges: workflow.edges ?? [],
        is_active: false,
      });
      setWorkflowList((current) => [...current, toWorkflowDefinition(saved)]);
      setShowWorkflowBuilder(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save this workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkflow = async (id: string) => {
    const workflow = workflowList.find((item) => item.id === id);
    if (!workflow || isSaving) return;
    setIsSaving(true);
    setApiError(null);
    try {
      const saved = await updateTaskadeWorkflow(id, !(workflow.active ?? false));
      setWorkflowList((current) => current.map((item) =>
        item.id === id ? toWorkflowDefinition(saved) : item
      ));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update this workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  const executeAgentAction = (act: AgentActionPayload, fallbackTask?: TaskItem | null) => {
    if (act.type === 'switch_view' && act.target) {
      setView(act.target as ProjectView);
      setSection('apps');
      setSelectedTask(null);
    } else if (act.type === 'switch_section' && act.target) {
      setSection(act.target as MainSection);
      setSelectedTask(null);
    } else if (act.type === 'switch_workspace' && act.target) {
      setSelectedTask(null);
      const targetDomain = act.target.toLowerCase();
      const matchedWs = workspaceList.find(
        (w) =>
          (w.domain && w.domain.toLowerCase().includes(targetDomain)) ||
          (w.slug && w.slug.toLowerCase().includes(targetDomain)) ||
          w.name.toLowerCase().includes(targetDomain)
      );
      if (matchedWs) {
        void selectWorkspace(matchedWs);
      }
    } else if (act.type === 'adapt_scenario' && act.target) {
      setActiveScenario(act.target as AdaptiveScenarioId);
      setView('adaptive');
      setSection('apps');
      setSelectedTask(null);
    } else if (act.type === 'open_adaptive') {
      onOpenAdaptiveCanvas();
    } else if (act.type === 'open_task') {
      const lookupId = act.taskId?.toLowerCase();
      const lookupTitle = act.taskTitle?.toLowerCase();
      const targetItem =
        (act.taskId ? tasks.find((t) => t.id === act.taskId) : undefined) ||
        (lookupTitle ? tasks.find((t) => t.title.toLowerCase().includes(lookupTitle) || lookupTitle.includes(t.title.toLowerCase())) : undefined) ||
        (lookupId ? tasks.find((t) => t.title.toLowerCase().includes(lookupId) || t.id.toLowerCase().includes(lookupId)) : undefined) ||
        fallbackTask;
      if (targetItem) {
        setSelectedTask(targetItem);
        setFocusedCell({ taskId: targetItem.id, field: act.field || 'all' });
        setTimeout(() => setFocusedCell(null), 3500);
      }
      setView('table');
      setSection('apps');
    } else if (act.type === 'update_field' && act.field) {
      const lookupTitle = act.taskTitle?.toLowerCase();
      const lookupId = act.taskId?.toLowerCase();
      const targetItem =
        (act.taskId ? tasks.find((t) => t.id === act.taskId) : undefined) ||
        (lookupTitle ? tasks.find((t) => t.title.toLowerCase().includes(lookupTitle) || lookupTitle.includes(t.title.toLowerCase())) : undefined) ||
        (lookupId ? tasks.find((t) => t.title.toLowerCase().includes(lookupId) || t.id.toLowerCase().includes(lookupId)) : undefined) ||
        fallbackTask;
      const actualId = targetItem ? targetItem.id : act.taskId;
      if (actualId) {
        const propField = act.field === 'due_date' ? 'dueDate' : act.field;
        void updateTaskField(actualId, propField as keyof TaskItem, act.value);
        setFocusedCell({ taskId: actualId, field: propField });
        setTimeout(() => setFocusedCell(null), 3500);
      }
    } else if (act.type === 'delete_task' && act.taskId) {
      void deleteTask(act.taskId);
    } else if (act.type === 'update_task' && act.taskId) {
      void toggleTask(act.taskId);
      setFocusedCell({ taskId: act.taskId, field: 'status' });
      setTimeout(() => setFocusedCell(null), 3500);
    } else if (act.type === 'filter_tasks') {
      setSearch(act.target || '');
      setSection('apps');
      if (view === 'adaptive') {
        setView('table');
      }
    } else if (act.type === 'create_task' && act.createdTask) {
      const item = toTaskItem(act.createdTask);
      setTasks((current) => [item, ...current]);
      setFocusedCell({ taskId: item.id, field: 'all' });
      setTimeout(() => setFocusedCell(null), 3500);
    }
  };

  const handleSelectOption = (messageId: string, option: AgentActionOption) => {
    setChatMessages((current) =>
      current.map((msg) => {
        if (msg.id !== messageId || !msg.options) return msg;
        return {
          ...msg,
          options: msg.options.map((opt) =>
            opt.id === option.id ? { ...opt, applied: true } : opt
          ),
        };
      })
    );

    executeAgentAction(option.action);
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || isSendingMessage || !activeWorkspace) return;

    const previousMessages = chatMessages;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
    };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput('');
    setIsSendingMessage(true);
    setApiError(null);

    try {
      const selectedAgent = agentList.find((agent) => agent.name === chatAgent);
      const result = await sendTaskadeAgentMessage({
        message,
        agentId: selectedAgent?.id,
        agentName: selectedAgent?.name || chatAgent || 'Prism AI',
        workspaceId: activeWorkspace.id,
        projectId: activeProject?.id,
        history: previousMessages.map(({ sender, text }) => ({ sender, text })),
        nodes: activeProject?.nodes ?? [],
      });

      // Execute AI actions on the workspace and table
      let newlyCreatedItem: TaskItem | null = null;
      if (result.createdTasks && result.createdTasks.length > 0) {
        const created = result.createdTasks.map(toTaskItem);
        newlyCreatedItem = created[0];
        setTasks((current) => [...created, ...current]);
        setProjectList((current) => current.map((project) => project.id === activeProject?.id
          ? { ...project, nodes: [...result.createdTasks, ...project.nodes] }
          : project));
      }

      if (result.actions && result.actions.length > 0) {
        for (const act of result.actions) {
          executeAgentAction(act, newlyCreatedItem);
        }
      }

      const actionSummary = result.actions && result.actions.length > 0
        ? result.actions.map((a) => a.label).filter(Boolean).join(' • ')
        : undefined;

      setChatMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: result.reply,
          actionTaken: actionSummary,
          options: result.options,
        },
      ]);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'The agent could not respond.';
      setApiError(messageText);
      setChatMessages((current) => [
        ...current,
        { id: `error-${Date.now()}`, sender: 'agent', text: `I couldn't complete that request: ${messageText}` },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openAgentChat = (name: string) => {
    setChatMessages([]);
    setChatAgent(name);
  };

  const openCreate = () => {
    setApiError(null);
    if (section === 'agents') {
      setShowAgentBuilder(true);
    } else if (section === 'workflows') {
      setShowWorkflowBuilder(true);
    } else {
      if (!activeProjectId) {
        setApiError('This workspace has no project to add tasks to.');
        return;
      }
      setShowTaskForm(true);
    }
  };

  const openSection = (next: MainSection) => {
    setSection(next);
    setMobileNavOpen(false);
    setSearch('');
  };

  return (
    <div className={`taskade-shell ${compactMode ? 'is-compact' : ''} ${chatAgent ? `has-agent-open is-${drawerMode}` : ''}`}>
      {mobileNavOpen && (
        <button
          type="button"
          className="td-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`td-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="td-sidebar-top">
          <a className="td-brand" href="#home" onClick={(event) => event.preventDefault()}>
            <TaskadeLogo />
            <span>PRISM</span>
            <ChevronDown size={15} />
          </a>
          <button
            type="button"
            className="td-icon-button td-sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="td-workspace-picker-wrap">
          <button
            type="button"
            className="td-workspace-picker"
            aria-expanded={workspaceMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setWorkspaceMenuOpen((open) => !open)}
          >
            <span className="td-workspace-copy">
              <strong>{activeWorkspace?.name ?? (isLoading ? 'Loading workspace…' : 'Workspace unavailable')}</strong>
              <small>{isFallback ? 'Sample data' : 'Connected workspace'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {workspaceMenuOpen && (
            <div className="td-workspace-menu" role="listbox" aria-label="Choose a workspace">
              {workspaceList.map((workspace) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={workspace.id === activeWorkspace?.id}
                  key={workspace.id}
                  onClick={() => void selectWorkspace(workspace)}
                >
                  <span><strong>{workspace.name}</strong><small>{workspace.domain ?? workspace.slug ?? 'Workspace'}</small></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="td-create-button" onClick={openCreate}>
          <Plus size={16} />
          <span>Create new</span>
          <span className="td-shortcut">⌘ K</span>
        </button>

        <nav className="td-sidebar-nav" aria-label="Workspace navigation">
          <span className="td-nav-label">WORKSPACE</span>
          <button
            type="button"
            className={`td-nav-item ${section === 'apps' ? 'is-active' : ''}`}
            onClick={() => openSection('apps')}
          >
            <LayoutGrid size={17} />
            <span>Apps</span>
            <span className="td-nav-count">{projectList.length}</span>
          </button>
          <button
            type="button"
            className={`td-nav-item ${section === 'agents' ? 'is-active' : ''}`}
            onClick={() => openSection('agents')}
          >
            <Bot size={17} />
            <span>Agents</span>
            <span className="td-nav-count">{agentList.length}</span>
          </button>
          <button
            type="button"
            className={`td-nav-item ${section === 'workflows' ? 'is-active' : ''}`}
            onClick={() => openSection('workflows')}
          >
            <Workflow size={17} />
            <span>Workflows</span>
            <span className="td-nav-count">{workflowList.length}</span>
          </button>

          <div className="td-project-heading">
            <span className="td-nav-label">YOUR PROJECTS</span>
            <button
              type="button"
              className="td-small-icon-button"
              aria-label="Create project"
              onClick={() => openSection('apps')}
            >
              <Plus size={15} />
            </button>
          </div>
          {projectList.map((project, index) => (
            <button
              type="button"
              key={project.id}
              className={`td-project-link ${section === 'apps' && activeProjectId === project.id ? 'is-active' : ''}`}
              onClick={() => {
                selectProject(project);
                openSection('apps');
              }}
            >
              <span className={`td-project-dot td-project-dot-${index + 1}`} />
              <span>{project.name}</span>
              <span className="td-project-unread">{project.nodes.length}</span>
            </button>
          ))}

          <div className="td-sidebar-spacer" />
          <div className="td-sidebar-upgrade">
            <div className="td-upgrade-icon"><Sparkles size={17} /></div>
            <strong>Make more with PRISM</strong>
            <p>Bring your projects and AI tools together in one place.</p>
            <button type="button" onClick={() => openSection('agents')}>
              Explore workspace <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            type="button"
            className="td-nav-item td-settings-link"
            onClick={() => {
              setMobileNavOpen(false);
              setShowSettingsPanel(true);
            }}
          >
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
        </nav>

      </aside>

      <div className="td-main">
        <header className="td-topbar">
          <button
            type="button"
            className="td-icon-button td-mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="td-breadcrumb">
            <strong className="td-workspace-breadcrumb">My Workspace</strong>
          </div>
          <div className="td-topbar-actions">
            <label className="td-search">
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search anything"
                aria-label="Search workspace"
              />
              <kbd><Command size={11} /> K</kbd>
            </label>
            <button type="button" className="td-icon-button td-notification" aria-label="Notifications">
              <Bell size={17} />
              <span />
            </button>
            <button
              type="button"
              className="td-help-button"
              onClick={() => {
                setChatMessages([]);
                setChatAgent(agentList[0]?.name ?? 'Prism AI');
              }}
            >
              <Sparkles size={14} /> Ask Prism AI
            </button>
          </div>
        </header>

        <div className="td-page">
          <nav className="td-section-tabs" aria-label="PRISM sections">
            <button type="button" className={section === 'apps' ? 'is-active' : ''} onClick={() => openSection('apps')}>
              <LayoutGrid size={16} /> Apps
            </button>
            <button type="button" className={section === 'agents' ? 'is-active' : ''} onClick={() => openSection('agents')}>
              <Bot size={16} /> Agents
            </button>
            <button type="button" className={section === 'workflows' ? 'is-active' : ''} onClick={() => openSection('workflows')}>
              <Workflow size={16} /> Workflows
            </button>
            <span className="td-tabs-spacer" />
            <span className={`td-sample-label ${isFallback ? 'is-fallback' : ''}`}><span />{isFallback ? 'Sample data · backend fallback' : 'Live workspace data'}</span>
          </nav>

          {apiError && (
            <div className="td-api-alert" role="alert">
              <strong>Workspace request failed</strong>
              <span>{apiError}</span>
            </div>
          )}
          {isLoading && <div className="td-data-loading" role="status">Loading workspace data…</div>}
          {section === 'apps' && (
            <AppsSection
              activeProject={activeProject?.name ?? 'No project selected'}
              tasks={filteredTasks}
              view={view}
              search={search}
              selectedTaskId={selectedTask?.id ?? null}
              focusedCell={focusedCell}
              activeScenario={activeScenario}
              onSelectScenario={setActiveScenario}
              onViewChange={setView}
              onToggleTask={toggleTask}
              onAddTask={openCreate}
              onOpenTask={(task) => setSelectedTask(task)}
              onUpdateField={updateTaskField}
              onDeleteTask={deleteTask}
              onOpenAdaptiveCanvas={onOpenAdaptiveCanvas}
              onOpenAgentChat={openAgentChat}
            />
          )}
          {section === 'agents' && (
            <AgentsSection
              agents={agentList}
              onChat={openAgentChat}
              onCreate={() => {
                setApiError(null);
                setShowAgentBuilder(true);
              }}
              onOpenAdaptiveCanvas={onOpenAdaptiveCanvas}
            />
          )}
          {section === 'workflows' && (
            <WorkflowsSection
              workflows={workflowList}
              activeWorkflows={activeWorkflows}
              isSaving={isSaving}
              onCreate={() => {
                setApiError(null);
                setShowWorkflowBuilder(true);
              }}
              onToggle={toggleWorkflow}
            />
          )}
        </div>
      </div>

      {chatAgent && (
        <AgentDrawer
          agentName={chatAgent}
          activeWorkspace={activeWorkspace}
          workspaces={workspaceList}
          activeView={view}
          activeSection={section}
          nodes={activeProject?.nodes ?? []}
          selectedTask={selectedTask}
          messages={chatMessages}
          input={chatInput}
          isSending={isSendingMessage}
          drawerMode={drawerMode}
          onToggleDrawerMode={() => setDrawerMode((m) => (m === 'docked' ? 'floating' : 'docked'))}
          onInputChange={setChatInput}
          onSend={sendMessage}
          onSelectOption={handleSelectOption}
          onSwitchView={(newView) => {
            setView(newView);
            setSection('apps');
          }}
          onSwitchSection={(newSec) => setSection(newSec)}
          onSwitchWorkspace={(ws) => void selectWorkspace(ws)}
          onOpenTask={(task) => setSelectedTask(task)}
          onOpenAdaptiveCanvas={onOpenAdaptiveCanvas}
          onClose={() => setChatAgent(null)}
        />
      )}
      {selectedTask && (
        <TaskDetailInspector
          task={selectedTask}
          workspaceName={activeWorkspace?.name ?? 'Workspace'}
          projectName={activeProject?.name ?? 'Project'}
          isAiTarget={focusedCell?.taskId === selectedTask.id}
          focusedField={focusedCell?.field}
          onClose={() => setSelectedTask(null)}
          onUpdateField={updateTaskField}
          onDeleteTask={deleteTask}
        />
      )}
      {showTaskForm && (
        <div className="td-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowTaskForm(false);
        }}>
          <form className="td-create-modal" onSubmit={addTask} aria-label="Create a task">
            <div className="td-modal-heading">
              <div><span className="td-modal-icon"><Plus size={17} /></span><h2>New task</h2></div>
              <button type="button" className="td-icon-button" aria-label="Close" onClick={() => setShowTaskForm(false)}><X size={18} /></button>
            </div>
            <label className="td-form-label" htmlFor="new-task-title">What needs to get done?</label>
            <input
              id="new-task-title"
              className="td-task-input"
              autoFocus
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Give your task a name"
              disabled={isSaving}
            />
            {apiError && <div className="td-form-error" role="alert">{apiError}</div>}
            <div className="td-modal-footer">
              <span>Adding to <strong>{activeProject?.name ?? 'No project'}</strong></span>
              <button type="submit" className="td-primary-button" disabled={!newTaskTitle.trim() || isSaving || !activeProjectId}>{isSaving ? 'Saving…' : 'Create task'} <ArrowUpRight size={15} /></button>
            </div>
          </form>
        </div>
      )}
      {showSettingsPanel && (
        <div
          className="td-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSettingsPanel(false);
          }}
        >
          <section className="td-create-modal td-settings-modal" role="dialog" aria-modal="true" aria-labelledby="workspace-settings-title">
            <div className="td-modal-heading">
              <div><span className="td-modal-icon"><Settings2 size={17} /></span><h2 id="workspace-settings-title">Workspace settings</h2></div>
              <button type="button" className="td-icon-button" aria-label="Close settings" onClick={() => setShowSettingsPanel(false)}><X size={18} /></button>
            </div>
            <p className="td-settings-description">Adjust how PRISM looks in this browser. These preferences do not change workspace data.</p>
            <div className="td-settings-group">
              <h3>Workspace</h3>
              <div className="td-settings-detail">
                <span>Connected workspace</span>
                <strong>{activeWorkspace?.name ?? 'Workspace unavailable'}</strong>
              </div>
              <div className="td-settings-detail">
                <span>Active project</span>
                <strong>{activeProject?.name ?? 'No project selected'}</strong>
              </div>
            </div>
            <div className="td-settings-group">
              <h3>Appearance</h3>
              <div className="td-settings-choice-row">
                <div><strong>Compact layout</strong><span>Reduce spacing in navigation and task lists.</span></div>
                <button
                  type="button"
                  className={`td-toggle ${compactMode ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={compactMode}
                  aria-label="Compact layout"
                  onClick={() => setCompactMode((current) => !current)}
                >
                  <span />
                </button>
              </div>
            </div>
            <div className="td-settings-footer">
              <span>Preferences apply locally while this workspace is open.</span>
              <button type="button" className="td-primary-button" onClick={() => setShowSettingsPanel(false)}>Done</button>
            </div>
          </section>
        </div>
      )}
      {showAgentBuilder && <AgentBuilder error={apiError} isSaving={isSaving} onClose={() => setShowAgentBuilder(false)} onCreate={addAgent} />}
      {showWorkflowBuilder && <WorkflowBuilder error={apiError} isSaving={isSaving} onClose={() => setShowWorkflowBuilder(false)} onCreate={addWorkflow} />}
    </div>
  );
};

interface AppsSectionProps {
  activeProject: string;
  tasks: TaskItem[];
  view: ProjectView;
  search: string;
  selectedTaskId: string | null;
  focusedCell: { taskId: string; field: string } | null;
  activeScenario: AdaptiveScenarioId;
  onSelectScenario: (scenario: AdaptiveScenarioId) => void;
  onViewChange: (view: ProjectView) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onOpenTask: (task: TaskItem) => void;
  onUpdateField: (taskId: string, field: keyof TaskItem, value: any) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAdaptiveCanvas: () => void;
  onOpenAgentChat?: (name: string) => void;
}

const AppsSection: React.FC<AppsSectionProps> = ({
  activeProject,
  tasks,
  view,
  search,
  selectedTaskId,
  focusedCell,
  activeScenario,
  onSelectScenario,
  onViewChange,
  onToggleTask,
  onAddTask,
  onOpenTask,
  onUpdateField,
  onDeleteTask,
  onOpenAdaptiveCanvas,
  onOpenAgentChat,
}) => {
  const completed = tasks.filter((task) => task.status === 'done').length;

  return (
    <section className="td-app-section">
      <div className="td-page-heading">
        <div>
          <div className="td-eyebrow"><span className="td-project-dot td-project-dot-1" /> PROJECT</div>
          <h1>{activeProject}</h1>
          <p>Plan the work, bring the team together, and make launch day a little less chaotic.</p>
        </div>
        <div className="td-heading-actions">
          <button type="button" className="td-secondary-button td-share-button"><Share2 size={15} /> Share</button>
          <button type="button" className="td-primary-button" onClick={onAddTask}><Plus size={16} /> Add task</button>
        </div>
      </div>

      <div className="td-project-meta">
        <div className="td-avatar-stack" aria-label="4 project members">
          <span className="td-mini-avatar td-avatar-peach">MC</span>
          <span className="td-mini-avatar td-avatar-lilac">JL</span>
          <span className="td-mini-avatar td-avatar-mint">AM</span>
          <span className="td-mini-avatar td-avatar-blue">SR</span>
        </div>
        <span className="td-meta-divider" />
        <span><Users size={14} /> 4 members</span>
        <span className="td-meta-divider" />
        <span><Check size={14} /> {completed} of {tasks.length} complete</span>
        <button type="button" className="td-more-button" aria-label="Project options"><MoreHorizontal size={18} /></button>
      </div>

      <div className="td-view-toolbar">
        <div className="td-view-switcher" role="tablist" aria-label="Project view">
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              role="tab"
              aria-selected={view === id}
              key={id}
              className={view === id ? 'is-active' : ''}
              onClick={() => onViewChange(id)}
            >
              <Icon size={15} /> <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="td-view-actions">
          <button type="button" className="td-tool-button"><Settings2 size={15} /><span>Customize</span></button>
          <button type="button" className="td-tool-button"><ArrowDown size={15} /><span>Sort</span></button>
          <button type="button" className="td-add-small" onClick={onAddTask}><Plus size={16} /><span>Add</span></button>
        </div>
      </div>

      {search && <div className="td-search-summary">Showing {tasks.length} results for <strong>“{search}”</strong></div>}
      {tasks.length === 0 ? (
        <div className="td-empty-state">
          {search ? <Search size={22} /> : <List size={22} />}
          <strong>{search ? 'No matching tasks' : 'No tasks in this project yet'}</strong>
          <span>{search ? 'Try another search term.' : 'Create a task to start organizing this project.'}</span>
          {!search && <button type="button" className="td-secondary-button" onClick={onAddTask}><Plus size={14} /> Add task</button>}
        </div>
      ) : (
        <ProjectViewContent
          tasks={tasks}
          view={view}
          activeScenario={activeScenario}
          selectedTaskId={selectedTaskId}
          focusedCell={focusedCell}
          onViewChange={onViewChange}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
          onOpenTask={onOpenTask}
          onUpdateField={onUpdateField}
          onDeleteTask={onDeleteTask}
          onOpenAgentChat={onOpenAgentChat}
        />
      )}

      <button type="button" className="td-adaptive-link" onClick={onOpenAdaptiveCanvas}>
        <Sparkles size={15} /> Open PRISM adaptive canvas <ArrowUpRight size={14} />
      </button>
    </section>
  );
};

interface ProjectViewContentProps {
  tasks: TaskItem[];
  view: ProjectView;
  activeScenario: AdaptiveScenarioId;
  selectedTaskId: string | null;
  focusedCell: { taskId: string; field: string } | null;
  onViewChange: (view: ProjectView) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onOpenTask: (task: TaskItem) => void;
  onUpdateField: (taskId: string, field: keyof TaskItem, value: any) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAgentChat?: (name: string) => void;
}

const ProjectViewContent: React.FC<ProjectViewContentProps> = ({
  tasks,
  view,
  activeScenario,
  selectedTaskId,
  focusedCell,
  onViewChange,
  onToggleTask,
  onAddTask,
  onOpenTask,
  onUpdateField,
  onDeleteTask,
  onOpenAgentChat,
}) => {
  if (view === 'adaptive') {
    return (
      <AdaptiveDeck
        initialScenario={activeScenario}
        onSwitchView={onViewChange}
        onOpenAgentChat={() => {
          if (onOpenAgentChat) onOpenAgentChat('Prism AI');
        }}
      />
    );
  }
  if (view === 'list') {
    return (
      <div className="td-list-view">
        {statusOrder.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status);
          if (!statusTasks.length) return null;
          return (
            <section className="td-list-group" key={status}>
              <h2><ChevronDown size={15} /><span className={`td-status-dot td-status-${status}`} />{statusLabels[status]}<span className="td-group-count">{statusTasks.length}</span></h2>
              {statusTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  isAiTarget={focusedCell?.taskId === task.id}
                  onToggle={onToggleTask}
                  onOpen={onOpenTask}
                />
              ))}
            </section>
          );
        })}
        <button type="button" className="td-add-row" onClick={onAddTask}><Plus size={15} /> Add a task</button>
      </div>
    );
  }

  if (view === 'board') {
    return (
      <div className="td-board-view">
        {statusOrder.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status);
          return (
            <section className="td-board-column" key={status}>
              <div className="td-column-heading">
                <div><span className={`td-status-dot td-status-${status}`} /><h2>{statusLabels[status]}</h2><span className="td-group-count">{statusTasks.length}</span></div>
                <button type="button" className="td-small-icon-button" aria-label={`Add ${statusLabels[status]} task`} onClick={onAddTask}><Plus size={15} /></button>
              </div>
              <div className="td-board-cards">
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    isAiTarget={focusedCell?.taskId === task.id}
                    onToggle={onToggleTask}
                    onOpen={onOpenTask}
                  />
                ))}
                <button type="button" className="td-column-add" onClick={onAddTask}><Plus size={14} /> Add task</button>
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  if (view === 'table') {
    return (
      <div className="td-table-wrap">
        <table className="td-data-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>Task / Record</th>
              <th style={{ width: '15%' }}>Status</th>
              <th style={{ width: '15%' }}>Priority</th>
              <th style={{ width: '16%' }}>Assignee</th>
              <th style={{ width: '12%' }}>Due Date</th>
              <th style={{ width: '4%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              const isAiTarget = focusedCell?.taskId === task.id;

              return (
                <tr
                  key={task.id}
                  className={`td-table-row ${isSelected ? 'is-selected-row' : ''} ${isAiTarget ? 'is-ai-pulse-row' : ''}`}
                >
                  <td className="td-table-title-cell">
                    <div className="td-title-container">
                      <TaskCheckbox task={task} onToggle={onToggleTask} />
                      <button
                        type="button"
                        className={`td-table-title-btn ${task.status === 'done' ? 'is-done' : ''}`}
                        onClick={() => onOpenTask(task)}
                        title="Click to inspect task fields"
                      >
                        <span>{task.title}</span>
                        <Eye size={12} className="td-open-indicator" />
                      </button>
                    </div>
                  </td>
                  <td className={`td-editable-cell ${isAiTarget && (focusedCell?.field === 'status' || focusedCell?.field === 'all') ? 'is-cell-pulsing' : ''}`}>
                    <select
                      className={`td-table-select td-pill-${task.status}`}
                      value={task.status}
                      onChange={(e) => onUpdateField(task.id, 'status', e.target.value)}
                      aria-label="Change status"
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="review">In review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className={`td-editable-cell ${isAiTarget && (focusedCell?.field === 'priority' || focusedCell?.field === 'all') ? 'is-cell-pulsing' : ''}`}>
                    <select
                      className={`td-table-select td-priority-select td-p-${task.priority}`}
                      value={task.priority}
                      onChange={(e) => onUpdateField(task.id, 'priority', e.target.value)}
                      aria-label="Change priority"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className={`td-editable-cell ${isAiTarget && (focusedCell?.field === 'assignee' || focusedCell?.field === 'all') ? 'is-cell-pulsing' : ''}`}>
                    <select
                      className="td-table-select td-assignee-select"
                      value={task.assignee}
                      onChange={(e) => onUpdateField(task.id, 'assignee', e.target.value)}
                      aria-label="Change assignee"
                    >
                      <option value="Sarah Lin">Sarah Lin</option>
                      <option value="Alex Rivera">Alex Rivera</option>
                      <option value="Marcus Vance">Marcus Vance</option>
                      <option value="AI Agent">AI Agent</option>
                      <option value="You">You</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </td>
                  <td className={`td-editable-cell ${isAiTarget && (focusedCell?.field === 'dueDate' || focusedCell?.field === 'due_date' || focusedCell?.field === 'all') ? 'is-cell-pulsing' : ''}`}>
                    <button
                      type="button"
                      className="td-due-date-btn"
                      onClick={() => onOpenTask(task)}
                      title="Edit due date"
                    >
                      <Clock3 size={11} /> {task.dueDate}
                    </button>
                  </td>
                  <td className="td-actions-cell">
                    <div className="td-row-actions">
                      <button
                        type="button"
                        className="td-row-action-btn"
                        onClick={() => onOpenTask(task)}
                        title="Inspect record fields"
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        type="button"
                        className="td-row-action-btn td-delete-btn"
                        onClick={() => {
                          if (window.confirm(`Delete "${task.title}"?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="td-table-footer-bar">
          <span>{tasks.length} records in active table</span>
          <button type="button" className="td-table-add-row-btn" onClick={onAddTask}>
            <Plus size={13} /> Add row
          </button>
        </div>
      </div>
    );
  }

  if (view === 'mindmap') {
    return (
      <div className="td-mindmap-view">
        <div className="td-mindmap-root"><Sparkles size={17} /><span>Product launch</span><small>{tasks.length} tasks</small></div>
        <div className="td-mindmap-branches">
          {statusOrder.slice(0, 3).map((status, index) => {
            const branchTasks = tasks.filter((task) => task.status === status);
            if (!branchTasks.length) return null;
            return (
              <div className={`td-mindmap-branch td-branch-${index + 1}`} key={status}>
                <div className="td-mindmap-category"><span className={`td-status-dot td-status-${status}`} />{statusLabels[status]}</div>
                <div className="td-mindmap-items">{branchTasks.map((task) => (
                  <button type="button" key={task.id} onClick={() => onOpenTask(task)} className={`td-mindmap-node ${task.status === 'done' ? 'is-done' : ''} ${selectedTaskId === task.id ? 'is-selected' : ''}`}>
                    <span className={`td-status-dot td-status-${task.status}`} />{task.title}
                  </button>
                ))}</div>
              </div>
            );
          })}
        </div>
        <div className="td-mindmap-footer"><GitBranch size={14} /> Click a task to inspect its fields</div>
      </div>
    );
  }

  return <CalendarView tasks={tasks} onToggleTask={onToggleTask} onOpenTask={onOpenTask} />;
};

const TaskCheckbox: React.FC<{ task: TaskItem; onToggle: (id: string) => void }> = ({ task, onToggle }) => (
  <button
    type="button"
    className={`td-task-check ${task.status === 'done' ? 'is-checked' : ''}`}
    aria-label={`${task.status === 'done' ? 'Reopen' : 'Complete'} ${task.title}`}
    onClick={() => onToggle(task.id)}
  >
    {task.status === 'done' && <Check size={12} />}
  </button>
);

const TaskRow: React.FC<{
  task: TaskItem;
  isSelected?: boolean;
  isAiTarget?: boolean;
  onToggle: (id: string) => void;
  onOpen: (task: TaskItem) => void;
}> = ({ task, isSelected, isAiTarget, onToggle, onOpen }) => (
  <div className={`td-task-row ${isSelected ? 'is-selected-row' : ''} ${isAiTarget ? 'is-ai-pulse-row' : ''}`}>
    <TaskCheckbox task={task} onToggle={onToggle} />
    <button
      type="button"
      className={`td-task-title td-task-row-btn ${task.status === 'done' ? 'is-done' : ''}`}
      onClick={() => onOpen(task)}
    >
      <span>{task.title}</span>
    </button>
    {task.tags.map((tag) => <span className="td-tag" key={tag}>{tag}</span>)}
    <span className={`td-priority td-priority-${task.priority}`}><span />{task.priority}</span>
    <span className="td-row-assignee"><span className="td-table-assignee">{task.assignee.slice(0, 1)}</span>{task.assignee}</span>
    <span className="td-row-due"><Clock3 size={13} />{task.dueDate}</span>
    <button type="button" className="td-small-icon-button" aria-label={`${task.title} options`} onClick={() => onOpen(task)}>
      <ExternalLink size={14} />
    </button>
  </div>
);

const TaskCard: React.FC<{
  task: TaskItem;
  isSelected?: boolean;
  isAiTarget?: boolean;
  onToggle: (id: string) => void;
  onOpen: (task: TaskItem) => void;
}> = ({ task, isSelected, isAiTarget, onToggle, onOpen }) => (
  <article className={`td-task-card ${task.status === 'done' ? 'is-complete' : ''} ${isSelected ? 'is-selected-card' : ''} ${isAiTarget ? 'is-ai-pulse-card' : ''}`}>
    <div className="td-card-topline">
      <span className={`td-priority td-priority-${task.priority}`}><span />{task.priority}</span>
      <button type="button" className="td-small-icon-button" aria-label={`Open ${task.title}`} onClick={() => onOpen(task)}>
        <ExternalLink size={14} />
      </button>
    </div>
    <div className="td-card-title-button">
      <TaskCheckbox task={task} onToggle={onToggle} />
      <span
        className={`td-card-title-text ${task.status === 'done' ? 'is-done' : ''}`}
        onClick={() => onOpen(task)}
      >
        {task.title}
      </span>
    </div>
    {task.content && <p onClick={() => onOpen(task)}>{task.content}</p>}
    <div className="td-card-tags">{task.tags.map((tag) => <span className="td-tag" key={tag}>{tag}</span>)}</div>
    <div className="td-card-footer" onClick={() => onOpen(task)}>
      <span className="td-card-person"><span className={`td-table-assignee td-assignee-${task.assignee.charCodeAt(0) % 4}`}>{task.assignee.slice(0, 1)}</span>{task.assignee.split(' ')[0]}</span>
      <span className="td-card-date"><Clock3 size={13} />{task.dueDate}</span>
    </div>
  </article>
);

const CalendarView: React.FC<{
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenTask?: (task: TaskItem) => void;
}> = ({ tasks, onToggleTask, onOpenTask }) => {
  const days = [
    { name: 'Mon', date: '12' },
    { name: 'Tue', date: '13' },
    { name: 'Wed', date: '14' },
    { name: 'Thu', date: '15' },
    { name: 'Fri', date: '16' },
    { name: 'Sat', date: '17' },
    { name: 'Sun', date: '18' },
  ];
  const getDayTasks = (day: typeof days[number]) => tasks.filter((task) => task.dueDate === 'Today' ? day.date === '12' : task.dueDate.endsWith(day.date));

  return (
    <div className="td-calendar-view">
      <div className="td-calendar-heading"><div><strong>October 12 – 18, 2026</strong><span>This week</span></div><div><button type="button" aria-label="Previous week"><ChevronDown className="td-chevron-left" size={17} /></button><button type="button" aria-label="Next week"><ChevronDown className="td-chevron-right" size={17} /></button></div></div>
      <div className="td-calendar-grid">
        {days.map((day) => (
          <section className={`td-calendar-day ${day.date === '12' ? 'is-today' : ''}`} key={day.date}>
            <div className="td-calendar-day-head"><span>{day.name}</span><strong>{day.date}</strong></div>
            {getDayTasks(day).map((task) => (
              <button
                type="button"
                className={`td-calendar-task td-calendar-${task.priority}`}
                key={task.id}
                onClick={() => (onOpenTask ? onOpenTask(task) : onToggleTask(task.id))}
              >
                {task.title}
              </button>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

const AgentsSection: React.FC<{
  agents: AgentProfile[];
  onChat: (name: string) => void;
  onCreate: () => void;
  onOpenAdaptiveCanvas: () => void;
}> = ({ agents, onChat, onCreate, onOpenAdaptiveCanvas }) => (
  <section className="td-directory-section">
    <div className="td-page-heading">
      <div><div className="td-eyebrow"><Bot size={14} /> YOUR AI TEAM</div><h1>Agents that work with you.</h1><p>Specialized assistants ready to help your workspace move forward.</p></div>
      <button type="button" className="td-primary-button" onClick={onCreate}><Plus size={16} /> Create an agent</button>
    </div>
    <div className="td-agent-summary"><span className="td-summary-icon"><Bot size={18} /></span><div><strong>Your team has {agents.length} agents</strong><p>Each agent has a role, a set of tools, and a model suited to its work.</p></div><span className="td-summary-pill">Ready to help</span></div>
    <div className="td-agent-grid">
      {agents.map((agent) => (
        <article className="td-agent-card" key={agent.id}>
          <div className="td-agent-card-head"><span className={`td-agent-avatar td-agent-${agent.color}`}>{agent.initials}</span><button type="button" className="td-small-icon-button" aria-label={`${agent.name} options`}><MoreHorizontal size={17} /></button></div>
          <h2>{agent.name}</h2><p>{agent.description}</p><span className="td-agent-persona">{agent.persona}</span>
          <div className="td-agent-skills">{agent.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          <div className="td-agent-card-foot"><span className="td-model-tier">{agent.tier}</span><button type="button" className="td-secondary-button" onClick={() => onChat(agent.name)}><MessageCircle size={14} /> Chat</button></div>
        </article>
      ))}
      <button type="button" className="td-agent-create-card" onClick={onCreate}>
        <span><Plus size={19} /></span><strong>Build an agent for your work</strong><small>Give it a role, tools, and a point of view.</small>
      </button>
    </div>
    <button type="button" className="td-adaptive-link" onClick={onOpenAdaptiveCanvas}><Sparkles size={15} /> Open PRISM adaptive canvas <ArrowUpRight size={14} /></button>
  </section>
);

interface WorkflowsSectionProps {
  workflows: WorkflowDefinition[];
  activeWorkflows: Record<string, boolean>;
  isSaving: boolean;
  onCreate: () => void;
  onToggle: (id: string) => void;
}

const WorkflowsSection: React.FC<WorkflowsSectionProps> = ({ workflows, activeWorkflows, isSaving, onCreate, onToggle }) => (
  <section className="td-directory-section">
    <div className="td-page-heading">
      <div><div className="td-eyebrow"><Workflow size={14} /> AUTOMATION STUDIO</div><h1>Make the busywork flow.</h1><p>Connect triggers and actions to keep your team's projects moving.</p></div>
      <button type="button" className="td-primary-button" onClick={onCreate}><Plus size={16} /> Create workflow</button>
    </div>
    <div className="td-workflow-banner">
      <div className="td-workflow-banner-icon"><Zap size={19} /></div>
      <div><strong>Your workflows, at a glance</strong><p>Review saved automations and turn them on or off.</p></div>
      <div className="td-workflow-stats"><span><strong>{Object.values(activeWorkflows).filter(Boolean).length}</strong> active</span><span><strong>—</strong> runs this week</span></div>
    </div>
    <div className="td-workflow-list">
      {workflows.map((flow) => (
        <article className="td-workflow-card" key={flow.id}>
          <div className="td-workflow-card-icon"><Workflow size={18} /></div>
          <div className="td-workflow-info"><div className="td-workflow-title-row"><h2>{flow.name}</h2><span className={`td-flow-state ${activeWorkflows[flow.id] ? 'is-active' : ''}`}><span />{activeWorkflows[flow.id] ? 'Active' : 'Paused'}</span></div><p>{flow.description}</p><span className="td-flow-trigger"><Clock3 size={13} />{flow.trigger}</span></div>
          <div className="td-flow-steps">{flow.steps.map((step, index) => <React.Fragment key={step}><span className={index === 0 ? 'is-trigger' : ''}>{index === 0 ? <Zap size={13} /> : index === flow.steps.length - 1 ? <Check size={13} /> : <Settings2 size={13} />}{step}</span>{index < flow.steps.length - 1 && <i />}</React.Fragment>)}</div>
          <div className="td-flow-last-run"><small>LAST RUN</small><span>{flow.lastRun}</span></div>
          <button type="button" className={`td-toggle ${activeWorkflows[flow.id] ? 'is-on' : ''}`} role="switch" aria-checked={Boolean(activeWorkflows[flow.id])} aria-label={`${activeWorkflows[flow.id] ? 'Pause' : 'Activate'} ${flow.name}`} onClick={() => onToggle(flow.id)} disabled={isSaving}><span /></button>
        </article>
      ))}
    </div>
  </section>
);

const AgentBuilder: React.FC<{
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (agent: Omit<AgentProfile, 'id' | 'initials' | 'color'>) => void;
}> = ({ error, isSaving, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tier, setTier] = useState<TaskadeModelTier>('STANDARD');
  const [tools, setTools] = useState<string[]>(['Workspace search']);
  const availableTools = ['Workspace search', 'Web search', 'Database query', 'Task updates'];

  const toggleTool = (tool: string) => {
    setTools((current) => current.includes(tool)
      ? current.filter((item) => item !== tool)
      : [...current, tool]);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPersona = persona.trim();
    const trimmedPrompt = systemPrompt.trim();
    if (!trimmedName || !trimmedPersona || !trimmedPrompt) return;
    onCreate({
      name: trimmedName,
      description: trimmedPersona,
      persona: trimmedPersona,
      systemPrompt: trimmedPrompt,
      tier,
      skills: tools,
    });
  };

  return (
    <div className="td-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="td-create-modal td-builder-modal" onSubmit={submit} aria-label="Create an AI agent">
        <div className="td-modal-heading">
          <div><span className="td-modal-icon"><Bot size={17} /></span><h2>Create an agent</h2></div>
          <button type="button" className="td-icon-button" aria-label="Close agent builder" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="td-builder-intro">Give your assistant a clear role, instructions, and the tools it can use.</p>
        <label className="td-form-label" htmlFor="agent-name">Agent name</label>
        <input id="agent-name" className="td-task-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer insights partner" required />
        <label className="td-form-label td-form-spaced" htmlFor="agent-persona">Persona</label>
        <input id="agent-persona" className="td-task-input" value={persona} onChange={(event) => setPersona(event.target.value)} placeholder="What is this agent's role?" required />
        <label className="td-form-label td-form-spaced" htmlFor="agent-system-prompt">Instructions</label>
        <textarea id="agent-system-prompt" className="td-builder-textarea" value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} placeholder="Describe how the agent should approach its work…" required />
        <div className="td-builder-split">
          <label className="td-form-label" htmlFor="agent-model">Model tier</label>
          <select id="agent-model" className="td-builder-select" value={tier} onChange={(event) => {
            const nextTier = event.target.value;
            if (nextTier === 'FAST' || nextTier === 'STANDARD' || nextTier === 'REASONING') setTier(nextTier);
          }}>
            <option value="FAST">Fast</option>
            <option value="STANDARD">Standard</option>
            <option value="REASONING">Reasoning</option>
          </select>
        </div>
        <fieldset className="td-tools-fieldset">
          <legend>Tools assigned</legend>
          <div>{availableTools.map((tool) => (
            <label key={tool}><input type="checkbox" checked={tools.includes(tool)} onChange={() => toggleTool(tool)} />{tool}</label>
          ))}</div>
        </fieldset>
        {error && <div className="td-form-error" role="alert">{error}</div>}
        <div className="td-modal-footer">
          <span>Saved to this workspace.</span>
          <button type="submit" className="td-primary-button" disabled={!name.trim() || !persona.trim() || !systemPrompt.trim() || isSaving}>{isSaving ? 'Saving…' : 'Create agent'} <ArrowUpRight size={15} /></button>
        </div>
      </form>
    </div>
  );
};

const WorkflowBuilder: React.FC<{
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (workflow: Omit<WorkflowDefinition, 'id' | 'lastRun' | 'initialActive'>) => void;
}> = ({ error, isSaving, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<TaskadeWorkflowRecord['trigger_type']>('item_change');
  const [action, setAction] = useState('Summarize project progress');
  const [description, setDescription] = useState('');
  const choices = ['Summarize project progress', 'Notify task owner', 'Create a team update'];
  const triggerLabels: Record<TaskadeWorkflowRecord['trigger_type'], string> = {
    schedule: 'On a schedule',
    webhook: 'On a webhook',
    item_change: 'When a task is updated',
    manual: 'Run manually',
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onCreate({
      name: trimmedName,
      description: description.trim() || `${action} when ${triggerLabels[trigger].toLowerCase()}.`,
      trigger: triggerLabels[trigger],
      steps: [trigger, action, 'Post a workspace update'],
      triggerType: trigger,
      triggerConfig: {},
      nodes: [
        { id: 'trigger', type: 'trigger', label: triggerLabels[trigger] },
        { id: 'action', type: 'action', label: action, action },
        { id: 'output', type: 'action', label: 'Post a workspace update', action: 'workspace_update' },
      ],
      edges: [
        { id: 'trigger-action', source: 'trigger', target: 'action' },
        { id: 'action-output', source: 'action', target: 'output' },
      ],
      active: false,
    });
  };

  return (
    <div className="td-modal-backdrop td-workflow-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="td-workflow-builder" onSubmit={submit} aria-label="Create a workflow">
        <header className="td-builder-header">
          <div><span className="td-modal-icon"><Workflow size={17} /></span><div><h2>Workflow builder</h2><p>Compose a trigger and actions for your workspace.</p></div></div>
          <button type="button" className="td-icon-button" aria-label="Close workflow builder" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="td-builder-workspace">
          <div className="td-builder-canvas">
            <div className="td-canvas-label"><span>CANVAS</span><span>Draft workflow</span></div>
            <div className="td-flow-node td-node-trigger"><span><Zap size={15} /></span><div><small>TRIGGER</small><strong>{triggerLabels[trigger]}</strong></div><MoreHorizontal size={15} /></div>
            <div className="td-node-connector"><i /></div>
            <div className="td-flow-node"><span><Sparkles size={15} /></span><div><small>AI ACTION</small><strong>{action}</strong></div><MoreHorizontal size={15} /></div>
            <div className="td-node-connector"><i /></div>
            <div className="td-flow-node td-node-output"><span><Check size={15} /></span><div><small>OUTPUT</small><strong>Post a workspace update</strong></div><MoreHorizontal size={15} /></div>
            <div className="td-builder-log"><div><Activity size={14} /><strong>Recent activity</strong></div><p>This workflow has not been run yet.</p></div>
          </div>
          <aside className="td-builder-settings">
            <h3>Workflow settings</h3>
            <label className="td-form-label" htmlFor="workflow-name">Name</label>
            <input id="workflow-name" className="td-task-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Project update digest" required />
            <label className="td-form-label td-form-spaced" htmlFor="workflow-description">Description</label>
            <textarea id="workflow-description" className="td-builder-textarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should this automation do?" />
            <label className="td-form-label td-form-spaced" htmlFor="workflow-trigger">Start when</label>
            <select id="workflow-trigger" className="td-builder-select" value={trigger} onChange={(event) => {
              const nextTrigger = event.target.value;
              if (nextTrigger === 'schedule' || nextTrigger === 'webhook' || nextTrigger === 'item_change' || nextTrigger === 'manual') {
                setTrigger(nextTrigger);
              }
            }}>
              <option value="item_change">When a task is updated</option>
              <option value="schedule">On a schedule</option>
              <option value="webhook">On a webhook</option>
              <option value="manual">Run manually</option>
            </select>
            <label className="td-form-label td-form-spaced" htmlFor="workflow-action">Then do</label>
            <select id="workflow-action" className="td-builder-select" value={action} onChange={(event) => setAction(event.target.value)}>
              {choices.map((choice) => <option key={choice}>{choice}</option>)}
            </select>
            <div className="td-builder-backend-note"><Sparkles size={14} /> Execution connects when the workflow backend is ready.</div>
            {error && <div className="td-form-error" role="alert">{error}</div>}
          </aside>
        </div>
        <footer className="td-builder-footer"><span>Saved to this workspace.</span><div><button type="button" className="td-secondary-button" onClick={onClose} disabled={isSaving}>Cancel</button><button type="submit" className="td-primary-button" disabled={!name.trim() || isSaving}>{isSaving ? 'Saving…' : 'Save workflow'} <ArrowUpRight size={15} /></button></div></footer>
      </form>
    </div>
  );
};

interface AgentDrawerProps {
  agentName: string;
  activeWorkspace: TaskadeWorkspaceRecord | null;
  workspaces: TaskadeWorkspaceRecord[];
  activeView: ProjectView;
  activeSection: MainSection;
  nodes: TaskadeNodeRecord[];
  selectedTask?: TaskItem | null;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  drawerMode?: 'docked' | 'floating';
  onToggleDrawerMode?: () => void;
  onInputChange: (value: string) => void;
  onSend: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitchView: (view: ProjectView) => void;
  onSwitchSection: (section: MainSection) => void;
  onSwitchWorkspace: (workspace: TaskadeWorkspaceRecord) => void;
  onOpenTask?: (task: TaskItem) => void;
  onOpenAdaptiveCanvas: () => void;
  onClose: () => void;
  onSelectOption?: (messageId: string, option: AgentActionOption) => void;
}

const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agentName,
  activeWorkspace,
  workspaces,
  activeView,
  activeSection,
  nodes,
  selectedTask,
  messages,
  input,
  isSending,
  drawerMode = 'docked',
  onToggleDrawerMode,
  onInputChange,
  onSend,
  onSwitchView,
  onSwitchSection,
  onSwitchWorkspace,
  onOpenTask,
  onOpenAdaptiveCanvas,
  onClose,
  onSelectOption,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (input.trim() && !isSending && activeWorkspace) {
        const fakeForm = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        onSend(fakeForm);
      }
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.25em]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-zinc-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="td-drawer-layer">
      <button
        type="button"
        className="td-drawer-backdrop"
        aria-label="Close assistant"
        onClick={onClose}
      />
      <aside className={`td-agent-drawer ${drawerMode === 'floating' ? 'is-floating' : ''}`} aria-label={`${agentName} panel`}>
        {/* Drawer Header */}
        <header className="td-agent-header">
          <div className="td-agent-identity">
            <span className="td-drawer-agent-icon">
              <Sparkles size={16} />
            </span>
            <div>
              <strong>{agentName}</strong>
              <small>
                <span className="td-online-dot" /> Workspace Intelligence
              </small>
            </div>
          </div>
          <div className="td-agent-header-actions">
            {onToggleDrawerMode && (
              <button
                type="button"
                className="td-icon-button"
                title={drawerMode === 'floating' ? 'Dock side-by-side' : 'Float window'}
                aria-label="Toggle drawer layout"
                onClick={onToggleDrawerMode}
              >
                <Layers size={15} />
              </button>
            )}
            <button
              type="button"
              className="td-icon-button"
              aria-label="Close assistant"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Live Context & Workspace Subheader */}
        <div className="td-drawer-context">
          <span>{activeWorkspace?.name ?? 'Workspace'}</span>
          <span>•</span>
          <span>{nodes.length} records in context</span>
        </div>

        {/* Active Target Record Banner if inspecting a task */}
        {selectedTask && (
          <div className="td-drawer-active-target">
            <div className="td-active-target-info">
              <span className="td-target-label">Focused:</span>
              <strong className="td-target-name">{selectedTask.title}</strong>
              <span className={`td-target-pill td-p-${selectedTask.priority}`}>
                {selectedTask.priority}
              </span>
              <span className={`td-target-pill td-s-${selectedTask.status}`}>
                {statusLabels[selectedTask.status]}
              </span>
            </div>
            <button
              type="button"
              className="td-target-open-btn"
              onClick={() => onOpenTask && onOpenTask(selectedTask)}
              title="Inspect fields"
            >
              Inspect <ExternalLink size={11} />
            </button>
          </div>
        )}

        {/* Quick Tab & Workspace Navigation Toolbar */}
        <div className="td-drawer-quick-tabs" aria-label="Views">
          <button
            type="button"
            onClick={() => onSwitchView('adaptive')}
            className={`td-drawer-tab-btn ${activeSection === 'apps' && activeView === 'adaptive' ? 'is-active' : ''}`}
            title="Switch to Adaptive Deck"
          >
            <Sparkles size={13} /> Adaptive
          </button>
          <button
            type="button"
            onClick={() => onSwitchView('calendar')}
            className={`td-drawer-tab-btn ${activeSection === 'apps' && activeView === 'calendar' ? 'is-active' : ''}`}
            title="Switch to Calendar view"
          >
            <CalendarDays size={13} /> Calendar
          </button>
          <button
            type="button"
            onClick={() => onSwitchView('table')}
            className={`td-drawer-tab-btn ${activeSection === 'apps' && activeView === 'table' ? 'is-active' : ''}`}
            title="Switch to Table view"
          >
            <Table2 size={13} /> Table
          </button>
          <button
            type="button"
            onClick={() => onSwitchView('board')}
            className={`td-drawer-tab-btn ${activeSection === 'apps' && activeView === 'board' ? 'is-active' : ''}`}
            title="Switch to Board view"
          >
            <LayoutGrid size={13} /> Board
          </button>
          <button
            type="button"
            onClick={() => onSwitchView('mindmap')}
            className={`td-drawer-tab-btn ${activeSection === 'apps' && activeView === 'mindmap' ? 'is-active' : ''}`}
            title="Switch to Mind Map view"
          >
            <GitBranch size={13} /> Mind Map
          </button>
          <button
            type="button"
            onClick={() => onSwitchSection('workflows')}
            className={`td-drawer-tab-btn ${activeSection === 'workflows' ? 'is-active' : ''}`}
            title="Open Automations Studio"
          >
            <Workflow size={13} /> Automations
          </button>
        </div>

        {/* Chat Messages Body */}
        {messages.length === 0 ? (
          <div className="td-chat-empty">
            <div className="td-chat-clean-icon">
              <Bot size={22} />
            </div>
            <h2>How can I help with your workspace?</h2>
            <p>
              Ask me to prepare a client meeting, investigate drops in usage, review overdue work, or update task details.
            </p>
            <div className="td-prompt-chips">
              <button
                type="button"
                onClick={() => onInputChange('I need to prepare tomorrow’s client meeting')}
              >
                <Sparkles size={13} />
                <span>Prepare Client Meeting</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('Investigate the drop in product usage this week')}
              >
                <TrendingDown size={13} />
                <span>Investigate Usage Drop</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('Review overdue project work and blockers')}
              >
                <Clock3 size={13} />
                <span>Review Overdue Work</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('Show Table view')}
              >
                <Table2 size={13} />
                <span>Show Table</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('Open Acme Corp Enterprise Contract Renewal')}
              >
                <Eye size={13} />
                <span>Open Acme Corp</span>
              </button>
              <button
                type="button"
                onClick={() => onInputChange('Set priority of Acme Corp to Critical')}
              >
                <Zap size={13} />
                <span>Set Critical Priority</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="td-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                className={`td-chat-message td-chat-${message.sender}`}
                key={message.id}
              >
                {message.sender === 'agent' ? (
                  <div className="td-chat-agent-bubble">
                    <span className="td-chat-message-icon">
                      <Sparkles size={13} />
                    </span>
                    <div className="td-chat-agent-content">
                      {message.actionTaken && (
                        <div className="td-chat-action-badge">
                          <Check size={11} />
                          <span>{message.actionTaken}</span>
                        </div>
                      )}
                      <div>{formatText(message.text)}</div>
                      {message.options && message.options.length > 0 && (
                        <div className="td-chat-options-group" role="group" aria-label="Select an action">
                          <span className="td-options-header">Select an action:</span>
                          <div className="td-chat-options-list">
                            {message.options.map((opt) => {
                              const isApplied = !!opt.applied;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  className={`td-chat-option-btn ${isApplied ? 'is-applied' : ''}`}
                                  disabled={isApplied}
                                  onClick={() => onSelectOption && onSelectOption(message.id, opt)}
                                  title={isApplied ? 'Action already applied' : opt.label}
                                >
                                  <span className="td-option-icon">
                                    {isApplied ? (
                                      <Check size={12} />
                                    ) : opt.icon === 'calendar' ? (
                                      <CalendarDays size={12} />
                                    ) : opt.icon === 'table' ? (
                                      <Table2 size={12} />
                                    ) : opt.icon === 'board' ? (
                                      <LayoutGrid size={12} />
                                    ) : opt.icon === 'mindmap' ? (
                                      <GitBranch size={12} />
                                    ) : opt.icon === 'zap' ? (
                                      <Zap size={12} />
                                    ) : opt.icon === 'user' ? (
                                      <Users size={12} />
                                    ) : opt.icon === 'filter' ? (
                                      <Filter size={12} />
                                    ) : opt.icon === 'plus' ? (
                                      <Plus size={12} />
                                    ) : opt.icon === 'inspect' ? (
                                      <Eye size={12} />
                                    ) : opt.icon === 'workflow' ? (
                                      <Workflow size={12} />
                                    ) : (
                                      <Sparkles size={12} />
                                    )}
                                  </span>
                                  <span className="td-option-label">{opt.label}</span>
                                  {isApplied && <span className="td-option-applied-tag">Applied</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
            ))}
            {isSending && (
              <div className="td-chat-typing" role="status">
                <span />
                <span />
                <span />
                <span>{agentName} is executing data operations…</span>
              </div>
            )}
          </div>
        )}

        {/* Composer */}
        <form className="td-chat-composer" onSubmit={onSend}>
          <textarea
            aria-label="Message the agent"
            placeholder={
              isSending
                ? 'Executing data operations…'
                : `Ask ${agentName} (e.g. "open calendar", "create task", "set priority")…`
            }
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || !activeWorkspace}
          />

          <div className="td-chat-composer-footer">
            <span className="td-composer-hint">Enter to send • Shift+Enter for new line</span>
            <button
              className="td-send-button"
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isSending || !activeWorkspace}
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
