import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  GitBranch,
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
  Sparkles,
  Table2,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import './TaskadeWorkspace.css';

type MainSection = 'apps' | 'agents' | 'workflows';
type ProjectView = 'list' | 'board' | 'mindmap' | 'table' | 'calendar';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

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
  name: string;
  description: string;
  persona: string;
  systemPrompt: string;
  tier: string;
  initials: string;
  color: string;
  skills: string[];
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  lastRun: string;
  initialActive: boolean;
}

interface TaskadeWorkspaceProps {
  onOpenAdaptiveCanvas: () => void;
}

const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Finalize launch messaging',
    content: 'Align the landing page headline with the product story.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Maya Chen',
    dueDate: 'Today',
    tags: ['Marketing', 'Launch'],
  },
  {
    id: 'task-2',
    title: 'Review onboarding flow',
    content: 'Check the first-run experience and activation steps.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jordan Lee',
    dueDate: 'Today',
    tags: ['Product'],
  },
  {
    id: 'task-3',
    title: 'Prepare launch announcement',
    content: 'Draft the customer email and social copy.',
    status: 'review',
    priority: 'high',
    assignee: 'Alex Morgan',
    dueDate: 'Oct 14',
    tags: ['Marketing'],
  },
  {
    id: 'task-4',
    title: 'QA the new workspace',
    content: 'Verify responsive layouts and keyboard interactions.',
    status: 'todo',
    priority: 'critical',
    assignee: 'Sam Rivera',
    dueDate: 'Oct 15',
    tags: ['Quality'],
  },
  {
    id: 'task-5',
    title: 'Collect beta feedback',
    content: 'Summarize the top themes from early-access users.',
    status: 'done',
    priority: 'low',
    assignee: 'Maya Chen',
    dueDate: 'Oct 11',
    tags: ['Research'],
  },
  {
    id: 'task-6',
    title: 'Publish help center guide',
    content: 'Document the key steps for new teams.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Jordan Lee',
    dueDate: 'Oct 16',
    tags: ['Content'],
  },
  {
    id: 'task-7',
    title: 'Confirm launch checklist',
    content: 'Review final owners and go-live readiness.',
    status: 'todo',
    priority: 'high',
    assignee: 'Alex Morgan',
    dueDate: 'Oct 17',
    tags: ['Operations'],
  },
];

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'In review',
  done: 'Done',
};

const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
const projectNames = ['Product launch', 'Customer research', 'Q3 planning'];

const agents: AgentProfile[] = [
  {
    id: 'research',
    name: 'Research assistant',
    description: 'Finds useful context across your notes, tasks, and connected sources.',
    persona: 'Curious research partner',
    systemPrompt: 'Find useful context and summarize it with sources.',
    tier: 'STANDARD',
    initials: 'RA',
    color: 'lavender',
    skills: ['Web research', 'Summaries'],
  },
  {
    id: 'project',
    name: 'Project coordinator',
    description: 'Keeps plans clear, tracks blockers, and turns updates into next steps.',
    persona: 'Organized project coordinator',
    systemPrompt: 'Track project health and suggest clear next steps.',
    tier: 'FAST',
    initials: 'PC',
    color: 'mint',
    skills: ['Planning', 'Task updates'],
  },
  {
    id: 'strategy',
    name: 'Strategy partner',
    description: 'Helps explore complex questions and organize decisions.',
    persona: 'Thoughtful strategy partner',
    systemPrompt: 'Help explore complex questions and structure decisions.',
    tier: 'REASONING',
    initials: 'SP',
    color: 'peach',
    skills: ['Analysis', 'Decision support'],
  },
];

const workflows: WorkflowDefinition[] = [
  {
    id: 'weekly-review',
    name: 'Weekly project review',
    description: 'Summarize progress and call out items that need attention.',
    trigger: 'Every Monday · 9:00 AM',
    steps: ['Schedule trigger', 'Gather project updates', 'Create a summary'],
    lastRun: 'Today, 9:00 AM',
    initialActive: true,
  },
  {
    id: 'task-follow-up',
    name: 'Overdue task follow-up',
    description: 'Notify task owners when a due date has passed.',
    trigger: 'When a task becomes overdue',
    steps: ['Task status change', 'Check due date', 'Notify owner'],
    lastRun: 'Yesterday, 4:32 PM',
    initialActive: true,
  },
  {
    id: 'new-feedback',
    name: 'Route new feedback',
    description: 'Organize new feedback and send it to the right project.',
    trigger: 'When feedback is added',
    steps: ['New item trigger', 'Classify feedback', 'Add to project'],
    lastRun: 'Oct 9, 11:18 AM',
    initialActive: false,
  },
];

const viewOptions: { id: ProjectView; label: string; icon: typeof List }[] = [
  { id: 'list', label: 'List', icon: List },
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'mindmap', label: 'Mind map', icon: GitBranch },
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

const TaskadeLogo: React.FC = () => (
  <span className="td-brand-mark" aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </span>
);

export const TaskadeWorkspace: React.FC<TaskadeWorkspaceProps> = ({ onOpenAdaptiveCanvas }) => {
  const [section, setSection] = useState<MainSection>('apps');
  const [view, setView] = useState<ProjectView>('board');
  const [activeProject, setActiveProject] = useState(projectNames[0]);
  const [tasks, setTasks] = useState(initialTasks);
  const [agentList, setAgentList] = useState(agents);
  const [workflowList, setWorkflowList] = useState(workflows);
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [activeWorkflows, setActiveWorkflows] = useState(
    Object.fromEntries(workflows.map(({ id, initialActive }) => [id, initialActive]))
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) =>
      [task.title, task.content, task.assignee, ...task.tags].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, tasks]);

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
          : task
      )
    );
  };

  const addTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    setTasks((current) => [
      {
        id: `task-${Date.now()}`,
        title,
        content: '',
        status: 'todo',
        priority: 'medium',
        assignee: 'You',
        dueDate: 'No date',
        tags: [],
      },
      ...current,
    ]);
    setNewTaskTitle('');
    setShowTaskForm(false);
  };

  const addAgent = (agent: Omit<AgentProfile, 'id' | 'initials' | 'color'>) => {
    const nameParts = agent.name.trim().split(/\s+/);
    setAgentList((current) => [
      ...current,
      {
        ...agent,
        id: `agent-${Date.now()}`,
        initials: nameParts.slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
        color: ['lavender', 'mint', 'peach'][current.length % 3],
      },
    ]);
    setShowAgentBuilder(false);
  };

  const addWorkflow = (workflow: Omit<WorkflowDefinition, 'id' | 'lastRun' | 'initialActive'>) => {
    const id = `workflow-${Date.now()}`;
    setWorkflowList((current) => [
      ...current,
      { ...workflow, id, lastRun: 'Not run yet', initialActive: false },
    ]);
    setActiveWorkflows((current) => ({ ...current, [id]: false }));
    setShowWorkflowBuilder(false);
  };

  const toggleWorkflow = (id: string) => {
    setActiveWorkflows((current) => ({ ...current, [id]: !current[id] }));
  };

  const openCreate = () => {
    if (section === 'agents') {
      setShowAgentBuilder(true);
    } else if (section === 'workflows') {
      setShowWorkflowBuilder(true);
    } else {
      setShowTaskForm(true);
    }
  };

  const openSection = (next: MainSection) => {
    setSection(next);
    setMobileNavOpen(false);
    setSearch('');
  };

  return (
    <div className="taskade-shell">
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

        <button type="button" className="td-workspace-picker">
          <span className="td-workspace-avatar">P</span>
          <span className="td-workspace-copy">
            <strong>Prism Studio</strong>
            <small>Free workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>

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
            <span className="td-nav-count">8</span>
          </button>
          <button
            type="button"
            className={`td-nav-item ${section === 'agents' ? 'is-active' : ''}`}
            onClick={() => openSection('agents')}
          >
            <Bot size={17} />
            <span>Agents</span>
            <span className="td-nav-count">3</span>
          </button>
          <button
            type="button"
            className={`td-nav-item ${section === 'workflows' ? 'is-active' : ''}`}
            onClick={() => openSection('workflows')}
          >
            <Workflow size={17} />
            <span>Workflows</span>
            <span className="td-nav-count">3</span>
          </button>

          <div className="td-project-heading">
            <span className="td-nav-label">YOUR PROJECTS</span>
            <button
              type="button"
              className="td-small-icon-button"
              aria-label="Create project"
              onClick={() => {
                setSection('apps');
                setShowTaskForm(true);
              }}
            >
              <Plus size={15} />
            </button>
          </div>
          {projectNames.map((project, index) => (
            <button
              type="button"
              key={project}
              className={`td-project-link ${section === 'apps' && activeProject === project ? 'is-active' : ''}`}
              onClick={() => {
                setActiveProject(project);
                openSection('apps');
              }}
            >
              <span className={`td-project-dot td-project-dot-${index + 1}`} />
              <span>{project}</span>
              {index === 0 && <span className="td-project-unread">4</span>}
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
          <button type="button" className="td-nav-item td-settings-link">
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="td-user-profile">
          <span className="td-user-avatar">MC</span>
          <span className="td-user-copy"><strong>Morgan Carter</strong><small>Personal workspace</small></span>
          <MoreHorizontal size={18} />
        </div>
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
            <span>Prism Studio</span>
            <ChevronRight size={14} />
            <strong>{section === 'apps' ? activeProject : section === 'agents' ? 'Agents' : 'Workflows'}</strong>
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
              <Activity size={17} />
              <span />
            </button>
            <button type="button" className="td-help-button" onClick={() => setChatAgent('PRISM assistant')}>
              <Sparkles size={15} /> Ask PRISM
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
            <span className="td-sample-label"><span /> Sample workspace</span>
          </nav>

          {section === 'apps' && (
            <AppsSection
              activeProject={activeProject}
              tasks={filteredTasks}
              view={view}
              search={search}
              onViewChange={setView}
              onToggleTask={toggleTask}
              onAddTask={() => setShowTaskForm(true)}
              onOpenAdaptiveCanvas={onOpenAdaptiveCanvas}
            />
          )}
          {section === 'agents' && (
            <AgentsSection
              agents={agentList}
              onChat={(name) => setChatAgent(name)}
              onCreate={() => setShowAgentBuilder(true)}
              onOpenAdaptiveCanvas={onOpenAdaptiveCanvas}
            />
          )}
          {section === 'workflows' && (
            <WorkflowsSection
              workflows={workflowList}
              activeWorkflows={activeWorkflows}
              onCreate={() => setShowWorkflowBuilder(true)}
              onToggle={toggleWorkflow}
            />
          )}
        </div>
      </div>

      {chatAgent && <AgentDrawer agentName={chatAgent} onClose={() => setChatAgent(null)} />}
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
            />
            <div className="td-modal-footer">
              <span>Adding to <strong>{activeProject}</strong></span>
              <button type="submit" className="td-primary-button" disabled={!newTaskTitle.trim()}>Create task <ArrowUpRight size={15} /></button>
            </div>
          </form>
        </div>
      )}
      {showAgentBuilder && <AgentBuilder onClose={() => setShowAgentBuilder(false)} onCreate={addAgent} />}
      {showWorkflowBuilder && <WorkflowBuilder onClose={() => setShowWorkflowBuilder(false)} onCreate={addWorkflow} />}
    </div>
  );
};

interface AppsSectionProps {
  activeProject: string;
  tasks: TaskItem[];
  view: ProjectView;
  search: string;
  onViewChange: (view: ProjectView) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onOpenAdaptiveCanvas: () => void;
}

const AppsSection: React.FC<AppsSectionProps> = ({
  activeProject,
  tasks,
  view,
  search,
  onViewChange,
  onToggleTask,
  onAddTask,
  onOpenAdaptiveCanvas,
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
        <div className="td-empty-state"><Search size={22} /><strong>No matching tasks</strong><span>Try another search term.</span></div>
      ) : (
        <ProjectViewContent
          tasks={tasks}
          view={view}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
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
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
}

const ProjectViewContent: React.FC<ProjectViewContentProps> = ({ tasks, view, onToggleTask, onAddTask }) => {
  if (view === 'list') {
    return (
      <div className="td-list-view">
        {statusOrder.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status);
          if (!statusTasks.length) return null;
          return (
            <section className="td-list-group" key={status}>
              <h2><ChevronDown size={15} /><span className={`td-status-dot td-status-${status}`} />{statusLabels[status]}<span className="td-group-count">{statusTasks.length}</span></h2>
              {statusTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggleTask} />)}
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
                {statusTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={onToggleTask} />)}
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
          <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due date</th></tr></thead>
          <tbody>{tasks.map((task) => (
            <tr key={task.id}>
              <td><TaskCheckbox task={task} onToggle={onToggleTask} /><span className={task.status === 'done' ? 'is-done' : ''}>{task.title}</span></td>
              <td><span className={`td-status-pill td-pill-${task.status}`}>{statusLabels[task.status]}</span></td>
              <td><span className={`td-priority td-priority-${task.priority}`}><span />{task.priority}</span></td>
              <td><span className="td-table-assignee">{task.assignee.slice(0, 1)}</span>{task.assignee}</td>
              <td>{task.dueDate}</td>
            </tr>
          ))}</tbody>
        </table>
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
                  <button type="button" key={task.id} onClick={() => onToggleTask(task.id)} className={`td-mindmap-node ${task.status === 'done' ? 'is-done' : ''}`}>
                    <span className={`td-status-dot td-status-${task.status}`} />{task.title}
                  </button>
                ))}</div>
              </div>
            );
          })}
        </div>
        <div className="td-mindmap-footer"><GitBranch size={14} /> Click a task to update its status</div>
      </div>
    );
  }

  return <CalendarView tasks={tasks} onToggleTask={onToggleTask} />;
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

const TaskRow: React.FC<{ task: TaskItem; onToggle: (id: string) => void }> = ({ task, onToggle }) => (
  <div className="td-task-row">
    <TaskCheckbox task={task} onToggle={onToggle} />
    <span className={`td-task-title ${task.status === 'done' ? 'is-done' : ''}`}>{task.title}</span>
    {task.tags.map((tag) => <span className="td-tag" key={tag}>{tag}</span>)}
    <span className={`td-priority td-priority-${task.priority}`}><span />{task.priority}</span>
    <span className="td-row-assignee"><span className="td-table-assignee">{task.assignee.slice(0, 1)}</span>{task.assignee}</span>
    <span className="td-row-due"><Clock3 size={13} />{task.dueDate}</span>
    <button type="button" className="td-small-icon-button" aria-label={`${task.title} options`}><MoreHorizontal size={16} /></button>
  </div>
);

const TaskCard: React.FC<{ task: TaskItem; onToggle: (id: string) => void }> = ({ task, onToggle }) => (
  <article className={`td-task-card ${task.status === 'done' ? 'is-complete' : ''}`}>
    <div className="td-card-topline">
      <span className={`td-priority td-priority-${task.priority}`}><span />{task.priority}</span>
      <button type="button" className="td-small-icon-button" aria-label={`${task.title} options`}><MoreHorizontal size={16} /></button>
    </div>
    <div className="td-card-title-button">
      <TaskCheckbox task={task} onToggle={onToggle} />
      <span className={task.status === 'done' ? 'is-done' : ''}>{task.title}</span>
    </div>
    {task.content && <p>{task.content}</p>}
    <div className="td-card-tags">{task.tags.map((tag) => <span className="td-tag" key={tag}>{tag}</span>)}</div>
    <div className="td-card-footer">
      <span className="td-card-person"><span className={`td-table-assignee td-assignee-${task.assignee.charCodeAt(0) % 4}`}>{task.assignee.slice(0, 1)}</span>{task.assignee.split(' ')[0]}</span>
      <span className="td-card-date"><Clock3 size={13} />{task.dueDate}</span>
    </div>
  </article>
);

const CalendarView: React.FC<{ tasks: TaskItem[]; onToggleTask: (id: string) => void }> = ({ tasks, onToggleTask }) => {
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
            {getDayTasks(day).map((task) => <button type="button" className={`td-calendar-task td-calendar-${task.priority}`} key={task.id} onClick={() => onToggleTask(task.id)}>{task.title}</button>)}
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
  onCreate: () => void;
  onToggle: (id: string) => void;
}

const WorkflowsSection: React.FC<WorkflowsSectionProps> = ({ workflows, activeWorkflows, onCreate, onToggle }) => (
  <section className="td-directory-section">
    <div className="td-page-heading">
      <div><div className="td-eyebrow"><Workflow size={14} /> AUTOMATION STUDIO</div><h1>Make the busywork flow.</h1><p>Connect triggers and actions to keep your team's projects moving.</p></div>
      <button type="button" className="td-primary-button" onClick={onCreate}><Plus size={16} /> Create workflow</button>
    </div>
    <div className="td-workflow-banner">
      <div className="td-workflow-banner-icon"><Zap size={19} /></div>
      <div><strong>Your workflows, at a glance</strong><p>Review automations and turn them on or off. This preview uses sample workspace data.</p></div>
      <div className="td-workflow-stats"><span><strong>{Object.values(activeWorkflows).filter(Boolean).length}</strong> active</span><span><strong>{workflows.length * 4}</strong> runs this week</span></div>
    </div>
    <div className="td-workflow-list">
      {workflows.map((flow) => (
        <article className="td-workflow-card" key={flow.id}>
          <div className="td-workflow-card-icon"><Workflow size={18} /></div>
          <div className="td-workflow-info"><div className="td-workflow-title-row"><h2>{flow.name}</h2><span className={`td-flow-state ${activeWorkflows[flow.id] ? 'is-active' : ''}`}><span />{activeWorkflows[flow.id] ? 'Active' : 'Paused'}</span></div><p>{flow.description}</p><span className="td-flow-trigger"><Clock3 size={13} />{flow.trigger}</span></div>
          <div className="td-flow-steps">{flow.steps.map((step, index) => <React.Fragment key={step}><span className={index === 0 ? 'is-trigger' : ''}>{index === 0 ? <Zap size={13} /> : index === flow.steps.length - 1 ? <Check size={13} /> : <Settings2 size={13} />}{step}</span>{index < flow.steps.length - 1 && <i />}</React.Fragment>)}</div>
          <div className="td-flow-last-run"><small>LAST RUN</small><span>{flow.lastRun}</span></div>
          <button type="button" className={`td-toggle ${activeWorkflows[flow.id] ? 'is-on' : ''}`} role="switch" aria-checked={Boolean(activeWorkflows[flow.id])} aria-label={`${activeWorkflows[flow.id] ? 'Pause' : 'Activate'} ${flow.name}`} onClick={() => onToggle(flow.id)}><span /></button>
        </article>
      ))}
    </div>
  </section>
);

const AgentBuilder: React.FC<{
  onClose: () => void;
  onCreate: (agent: Omit<AgentProfile, 'id' | 'initials' | 'color'>) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tier, setTier] = useState('STANDARD');
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
          <select id="agent-model" className="td-builder-select" value={tier} onChange={(event) => setTier(event.target.value)}>
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
        <div className="td-modal-footer">
          <span>Saved to this sample workspace only.</span>
          <button type="submit" className="td-primary-button" disabled={!name.trim() || !persona.trim() || !systemPrompt.trim()}>Create agent <ArrowUpRight size={15} /></button>
        </div>
      </form>
    </div>
  );
};

const WorkflowBuilder: React.FC<{
  onClose: () => void;
  onCreate: (workflow: Omit<WorkflowDefinition, 'id' | 'lastRun' | 'initialActive'>) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('When a task is updated');
  const [action, setAction] = useState('Summarize project progress');
  const [description, setDescription] = useState('');
  const choices = ['Summarize project progress', 'Notify task owner', 'Create a team update'];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onCreate({
      name: trimmedName,
      description: description.trim() || `${action} when ${trigger.toLowerCase()}.`,
      trigger,
      steps: [trigger, action, 'Post a workspace update'],
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
            <div className="td-flow-node td-node-trigger"><span><Zap size={15} /></span><div><small>TRIGGER</small><strong>{trigger}</strong></div><MoreHorizontal size={15} /></div>
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
            <select id="workflow-trigger" className="td-builder-select" value={trigger} onChange={(event) => setTrigger(event.target.value)}>
              <option>When a task is updated</option>
              <option>On a schedule</option>
              <option>When a new item is created</option>
              <option>Run manually</option>
            </select>
            <label className="td-form-label td-form-spaced" htmlFor="workflow-action">Then do</label>
            <select id="workflow-action" className="td-builder-select" value={action} onChange={(event) => setAction(event.target.value)}>
              {choices.map((choice) => <option key={choice}>{choice}</option>)}
            </select>
            <div className="td-builder-backend-note"><Sparkles size={14} /> Execution connects when the workflow backend is ready.</div>
          </aside>
        </div>
        <footer className="td-builder-footer"><span>Drafts are stored in this browser preview.</span><div><button type="button" className="td-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="td-primary-button" disabled={!name.trim()}>Save workflow <ArrowUpRight size={15} /></button></div></footer>
      </form>
    </div>
  );
};

const AgentDrawer: React.FC<{ agentName: string; onClose: () => void }> = ({ agentName, onClose }) => (
  <div className="td-drawer-layer">
    <button type="button" className="td-drawer-backdrop" aria-label="Close assistant" onClick={onClose} />
    <aside className="td-agent-drawer" aria-label={`${agentName} panel`}>
      <header><div><span className="td-drawer-agent-icon"><Sparkles size={17} /></span><div><strong>{agentName}</strong><small><span /> AI assistant</small></div></div><button type="button" className="td-icon-button" aria-label="Close assistant" onClick={onClose}><X size={18} /></button></header>
      <div className="td-drawer-context"><Sparkles size={15} /><span>Knows about <strong>{projectNames[0]}</strong></span><ChevronDown size={14} /></div>
      <div className="td-chat-empty"><div className="td-chat-orb"><Sparkles size={22} /></div><h2>What can I help with?</h2><p>Ask a question, explore an idea, or get help moving your project forward.</p>      <div className="td-prompt-chips"><span>Summarize project progress</span><span>What needs attention?</span><span>Help me plan this week</span></div></div>
      <div className="td-chat-pending"><Sparkles size={15} /><span>Agent chat will be connected by the integration backend.</span></div>
      <form className="td-chat-composer" onSubmit={(event) => event.preventDefault()}>
        <textarea aria-label="Message the agent" placeholder="Message your agent…" disabled />
        <div><button type="button" aria-label="Add attachment" disabled><Plus size={16} /></button><span>Enter to send</span><button className="td-send-button" type="submit" aria-label="Send message" disabled><Send size={15} /></button></div>
      </form>
    </aside>
  </div>
);
