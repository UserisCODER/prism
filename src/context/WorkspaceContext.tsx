import React, { createContext, useContext, useState } from 'react';
import { ComponentMetadata, IntentParseResult, LayoutPlan, PanelPlan, WorkspaceDefinition } from '../types';
import { executePanelAction, fetchWorkspaceComponents, processUserIntent } from '../services/apiClient';
import { parseIntentInput, buildLayoutPlan } from '../services/intentEngine';
import { COMPONENT_REGISTRY } from '../data/componentCatalog';
import { WORKSPACES } from '../data/workspaces';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface WorkspaceContextType {
  currentIntent: IntentParseResult;
  layoutPlan: LayoutPlan;
  activeWorkspace: WorkspaceDefinition;
  activeRegistry: Record<string, ComponentMetadata>;
  isLoadingWorkspace: boolean;
  isAnalyzing: boolean;
  toasts: Toast[];
  pinnedIds: string[];
  undoStack: LayoutPlan[];
  explainModalPanel: PanelPlan | null;
  showClarifyingModal: boolean;
  submitIntent: (input: string) => Promise<void>;
  selectWorkspace: (workspace: WorkspaceDefinition) => Promise<void>;
  togglePinPanel: (instanceId: string) => void;
  undoLayout: () => void;
  resetLayout: () => void;
  openExplainModal: (panel: PanelPlan) => void;
  closeExplainModal: () => void;
  dismissClarifyingModal: () => void;
  triggerAction: (actionName: string, details: string) => Promise<void>;
  removeToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialIntent = parseIntentInput("Prepare tomorrow's client meeting");
  const initialLayout = buildLayoutPlan(initialIntent);

  const [currentIntent, setCurrentIntent] = useState<IntentParseResult>(initialIntent);
  const [layoutPlan, setLayoutPlan] = useState<LayoutPlan>(initialLayout);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDefinition>(WORKSPACES[0]);
  const [activeRegistry, setActiveRegistry] = useState<Record<string, ComponentMetadata>>(COMPONENT_REGISTRY);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<LayoutPlan[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [explainModalPanel, setExplainModalPanel] = useState<PanelPlan | null>(null);
  const [showClarifyingModal, setShowClarifyingModal] = useState<boolean>(false);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const selectWorkspace = async (workspace: WorkspaceDefinition) => {
    setIsLoadingWorkspace(true);
    try {
      const components = await fetchWorkspaceComponents(workspace.domain);
      setActiveRegistry(components);
      setActiveWorkspace(workspace);
      addToast('Workspace Connected', `Loaded components for ${workspace.name}.`, 'success');
    } catch (err) {
      console.error('Failed to load workspace components:', err);
      addToast('Workspace Error', `Failed to load components for ${workspace.name}.`, 'warning');
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const submitIntent = async (input: string) => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const { intent, layout } = await processUserIntent(
        input,
        layoutPlan,
        activeWorkspace,
        activeRegistry
      );

      // Save current layout to undo stack
      setUndoStack((prev) => [layoutPlan, ...prev].slice(0, 5));
      setCurrentIntent(intent);
      setLayoutPlan(layout);

      if (intent.confidence < 0.85 && intent.clarifying_question) {
        setShowClarifyingModal(true);
      } else {
        setShowClarifyingModal(false);
      }

      addToast(
        'Workspace Re-arranged',
        `Layout dynamically adapted for: "${intent.goal}"`,
        'info'
      );
    } catch (err) {
      addToast('Synthesis Error', 'Failed to parse intent. Reverting to safe layout.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePinPanel = (instanceId: string) => {
    setPinnedIds((prev) => {
      const isPinned = prev.includes(instanceId);
      const next = isPinned ? prev.filter((id) => id !== instanceId) : [...prev, instanceId];
      
      addToast(
        isPinned ? 'Panel Unpinned' : 'Panel Pinned',
        isPinned ? 'Panel will re-arrange on next intent.' : 'Panel locked into workspace.',
        'info'
      );
      return next;
    });

    // Update layout plan state
    setLayoutPlan((prev) => {
      const isPinnedNow = !pinnedIds.includes(instanceId);
      const updatePanel = (p?: PanelPlan) => p ? (p.instanceId === instanceId ? { ...p, isPinned: isPinnedNow } : p) : undefined;

      return {
        ...prev,
        hero: updatePanel(prev.hero),
        primary: prev.primary.map((p) => (p.instanceId === instanceId ? { ...p, isPinned: isPinnedNow } : p)),
        secondary: prev.secondary.map((p) => (p.instanceId === instanceId ? { ...p, isPinned: isPinnedNow } : p)),
        pinnedIds: isPinnedNow ? [...prev.pinnedIds, instanceId] : prev.pinnedIds.filter(id => id !== instanceId),
      };
    });
  };

  const undoLayout = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[0];
    setUndoStack((prev) => prev.slice(1));
    setLayoutPlan(previous);
    addToast('Layout Restored', 'Reverted to previous layout state.', 'info');
  };

  const resetLayout = () => {
    const defaultIntent = parseIntentInput("Overview of workspace");
    const defaultPlan = buildLayoutPlan(defaultIntent);
    setUndoStack((prev) => [layoutPlan, ...prev].slice(0, 5));
    setCurrentIntent(defaultIntent);
    setLayoutPlan(defaultPlan);
    setPinnedIds([]);
    addToast('Workspace Reset', 'Reverted to generic executive review mode.', 'info');
  };

  const openExplainModal = (panel: PanelPlan) => {
    setExplainModalPanel(panel);
  };

  const closeExplainModal = () => {
    setExplainModalPanel(null);
  };

  const dismissClarifyingModal = () => {
    setShowClarifyingModal(false);
  };

  const triggerAction = async (actionName: string, details: string) => {
    addToast('Executing Action', `Submitting "${actionName}" to database...`, 'info');
    const result = await executePanelAction(actionName, { details });
    if (result.success) {
      addToast('Action Completed', result.message, 'success');
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentIntent,
        layoutPlan,
        activeWorkspace,
        activeRegistry,
        isLoadingWorkspace,
        isAnalyzing,
        toasts,
        pinnedIds,
        undoStack,
        explainModalPanel,
        showClarifyingModal,
        submitIntent,
        selectWorkspace,
        togglePinPanel,
        undoLayout,
        resetLayout,
        openExplainModal,
        closeExplainModal,
        dismissClarifyingModal,
        triggerAction,
        removeToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
