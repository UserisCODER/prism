export interface StoredPanel {
  component_id: string
  reason: string
  zone?: string
  priority?: number
  [key: string]: unknown
}

export type DebugEntry = {
  intent: any
  layout: any
  panels: StoredPanel[]
  timestamp: string
}

let lastEntry: DebugEntry | null = null

export function setLastEntry(intentOrEntry: any, layoutOrPanels?: any) {
  if (
    intentOrEntry &&
    typeof intentOrEntry === 'object' &&
    'panels' in intentOrEntry &&
    layoutOrPanels === undefined
  ) {
    const panelsList = Array.isArray(intentOrEntry.panels) ? intentOrEntry.panels : []
    lastEntry = {
      intent: intentOrEntry.intent,
      layout: intentOrEntry.layout ?? panelsList,
      panels: panelsList,
      timestamp: intentOrEntry.timestamp || new Date().toISOString(),
    }
    return
  }

  const panelsList: StoredPanel[] = Array.isArray(layoutOrPanels)
    ? layoutOrPanels
    : Array.isArray(layoutOrPanels?.panels)
    ? layoutOrPanels.panels
    : []

  lastEntry = {
    intent: intentOrEntry,
    layout: layoutOrPanels,
    panels: panelsList,
    timestamp: new Date().toISOString(),
  }
}

export function getLastEntry(): DebugEntry | null {
  return lastEntry
}

