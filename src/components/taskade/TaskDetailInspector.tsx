import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';
import { TaskadePriority, TaskadeStatus } from '../../services/taskadeApi';

export interface TaskItem {
  id: string;
  title: string;
  content: string;
  status: TaskadeStatus;
  priority: TaskadePriority;
  assignee: string;
  dueDate: string;
  tags: string[];
}

export interface TaskDetailInspectorProps {
  task: TaskItem;
  workspaceName: string;
  projectName: string;
  isAiTarget?: boolean;
  focusedField?: string | null;
  onClose: () => void;
  onUpdateField: (taskId: string, field: keyof TaskItem, value: any) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusOptions: { value: TaskadeStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To do', color: '#898b84' },
  { value: 'in_progress', label: 'In progress', color: '#6d58d7' },
  { value: 'review', label: 'In review', color: '#e0a562' },
  { value: 'done', label: 'Done', color: '#10b981' },
];

const priorityOptions: { value: TaskadePriority; label: string; dot: string }[] = [
  { value: 'critical', label: 'Critical', dot: '#ef4444' },
  { value: 'high', label: 'High', dot: '#f97316' },
  { value: 'medium', label: 'Medium', dot: '#eab308' },
  { value: 'low', label: 'Low', dot: '#10b981' },
];

const assigneePresets = [
  'Sarah Lin',
  'Alex Rivera',
  'Marcus Vance',
  'AI Agent',
  'You',
];

export const TaskDetailInspector: React.FC<TaskDetailInspectorProps> = ({
  task,
  workspaceName,
  projectName,
  isAiTarget,
  focusedField,
  onClose,
  onUpdateField,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setContent(task.content);
  }, [task]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdateField(task.id, 'title', title.trim());
      triggerSaveFlash();
    }
  };

  const handleContentBlur = () => {
    if (content !== task.content) {
      onUpdateField(task.id, 'content', content);
      triggerSaveFlash();
    }
  };

  const triggerSaveFlash = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (tag && !task.tags.includes(tag)) {
      onUpdateField(task.id, 'tags', [...task.tags, tag]);
      setNewTagInput('');
      setShowTagInput(false);
      triggerSaveFlash();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateField(task.id, 'tags', task.tags.filter((t) => t !== tagToRemove));
    triggerSaveFlash();
  };

  return (
    <div
      className="td-modal-backdrop td-inspector-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="td-inspector-modal" role="dialog" aria-label={`Task: ${task.title}`}>
        {/* Header */}
        <header className="td-inspector-header">
          <div className="td-inspector-breadcrumbs">
            <span>{workspaceName}</span>
            <span>/</span>
            <span>{projectName}</span>
            <span>/</span>
            <strong className="td-inspector-id">{task.id}</strong>
          </div>
          <div className="td-inspector-actions">
            {isAiTarget && (
              <span className="td-ai-synced-badge">
                <Sparkles size={11} /> AI synced
              </span>
            )}
            {savedFlash && (
              <span className="td-saved-badge">
                <Check size={12} /> Saved
              </span>
            )}
            <button
              type="button"
              className="td-inspector-delete-btn"
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"?`)) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              title="Delete record"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              className="td-icon-button"
              onClick={onClose}
              aria-label="Close inspector"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="td-inspector-body">
          {/* Title Field */}
          <div className="td-inspector-title-row">
            <input
              type="text"
              className="td-inspector-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Task title…"
            />
          </div>

          {/* Properties Grid */}
          <div className="td-inspector-properties">
            {/* Status Field */}
            <div className={`td-property-row ${focusedField === 'status' ? 'is-focused-property' : ''}`}>
              <div className="td-prop-label">
                <CheckCircle2 size={14} /> Status
              </div>
              <div className="td-prop-value">
                <div className="td-inspector-pill-group">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`td-inspector-pill ${task.status === opt.value ? 'is-selected' : ''}`}
                      onClick={() => {
                        onUpdateField(task.id, 'status', opt.value);
                        triggerSaveFlash();
                      }}
                    >
                      <span className="td-dot" style={{ backgroundColor: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Field */}
            <div className={`td-property-row ${focusedField === 'priority' ? 'is-focused-property' : ''}`}>
              <div className="td-prop-label">
                <Zap size={14} /> Priority
              </div>
              <div className="td-prop-value">
                <div className="td-inspector-pill-group">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`td-inspector-pill td-p-${opt.value} ${task.priority === opt.value ? 'is-selected' : ''}`}
                      onClick={() => {
                        onUpdateField(task.id, 'priority', opt.value);
                        triggerSaveFlash();
                      }}
                    >
                      <span className="td-dot" style={{ backgroundColor: opt.dot }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assignee Field */}
            <div className={`td-property-row ${focusedField === 'assignee' ? 'is-focused-property' : ''}`}>
              <div className="td-prop-label">
                <User size={14} /> Assignee
              </div>
              <div className="td-prop-value td-assignee-prop-value">
                <select
                  className="td-inspector-select"
                  value={task.assignee}
                  onChange={(e) => {
                    onUpdateField(task.id, 'assignee', e.target.value);
                    triggerSaveFlash();
                  }}
                >
                  {assigneePresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                  {!assigneePresets.includes(task.assignee) && (
                    <option value={task.assignee}>{task.assignee}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Due Date Field */}
            <div className={`td-property-row ${focusedField === 'due_date' || focusedField === 'dueDate' ? 'is-focused-property' : ''}`}>
              <div className="td-prop-label">
                <CalendarDays size={14} /> Due Date
              </div>
              <div className="td-prop-value td-due-date-row">
                <input
                  type="text"
                  className="td-inspector-input"
                  value={task.dueDate}
                  onChange={(e) => onUpdateField(task.id, 'dueDate', e.target.value)}
                  placeholder="e.g. Today, Tomorrow, Oct 25"
                />
                <div className="td-due-quick-chips">
                  <button type="button" onClick={() => onUpdateField(task.id, 'dueDate', 'Today')}>
                    Today
                  </button>
                  <button type="button" onClick={() => onUpdateField(task.id, 'dueDate', 'Tomorrow')}>
                    Tomorrow
                  </button>
                  <button type="button" onClick={() => onUpdateField(task.id, 'dueDate', 'Next week')}>
                    Next week
                  </button>
                </div>
              </div>
            </div>

            {/* Tags Field */}
            <div className={`td-property-row ${focusedField === 'tags' ? 'is-focused-property' : ''}`}>
              <div className="td-prop-label">
                <Tag size={14} /> Tags
              </div>
              <div className="td-prop-value td-tags-prop-value">
                <div className="td-tags-wrap">
                  {task.tags.map((tag) => (
                    <span className="td-inspector-tag" key={tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <form onSubmit={handleAddTag} className="td-add-tag-form">
                      <input
                        autoFocus
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onBlur={() => setShowTagInput(false)}
                        placeholder="Tag name…"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="td-add-tag-btn"
                      onClick={() => setShowTagInput(true)}
                    >
                      <Plus size={11} /> Add tag
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className={`td-inspector-notes ${focusedField === 'content' ? 'is-focused-property' : ''}`}>
            <label className="td-form-label" htmlFor="inspector-notes">
              Notes, Specifications & Blocker Context
            </label>
            <textarea
              id="inspector-notes"
              className="td-inspector-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              placeholder="Enter contract terms, SLA details, stakeholder notes, or task background here…"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="td-inspector-footer">
          <span className="td-inspector-meta">
            <Clock3 size={12} /> Real-time sync with database active
          </span>
          <button type="button" className="td-primary-button" onClick={onClose}>
            Done <Check size={14} />
          </button>
        </footer>
      </div>
    </div>
  );
};
