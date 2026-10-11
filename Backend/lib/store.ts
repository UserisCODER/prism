import { supabase } from '@/lib/supabase'

export interface StoredPanel {
  component_id: string
  reason: string
  zone?: string
  priority?: number
  data?: Record<string, any>
  [key: string]: unknown
}

export type DebugEntry = {
  intent: any
  layout: any
  panels: StoredPanel[]
  data?: Record<string, any>
  timestamp: string
}

export async function setLastEntry(
  intentOrEntry: any,
  layoutOrPanels?: any,
  entryData?: Record<string, any>
): Promise<void> {
  let intent = intentOrEntry
  let panels = layoutOrPanels
  let data = entryData

  if (
    intentOrEntry &&
    typeof intentOrEntry === 'object' &&
    'panels' in intentOrEntry &&
    layoutOrPanels === undefined
  ) {
    intent = intentOrEntry.intent
    panels = intentOrEntry.panels
    data = intentOrEntry.data
  }

  const panelsList: StoredPanel[] = Array.isArray(panels)
    ? panels
    : Array.isArray(panels?.panels)
    ? panels.panels
    : []

  const timestamp = new Date().toISOString()

  try {
    const { error } = await supabase
      .from('last_layout')
      .upsert({
        id: 'singleton',
        intent: intent ?? null,
        panels: panelsList,
        data: data ?? null,
        timestamp,
      })

    if (error) {
      console.error('[store] Failed to save last layout:', error)
    }
  } catch (err) {
    console.error('[store] Error saving last layout:', err)
  }
}

export async function getLastEntry(): Promise<DebugEntry | null> {
  try {
    const { data, error } = await supabase
      .from('last_layout')
      .select('intent, panels, data, timestamp')
      .eq('id', 'singleton')
      .maybeSingle()

    if (error || !data || (!data.intent && !data.panels)) {
      if (error) {
        console.error('[store] Failed to get last layout:', error)
      }
      return null
    }

    const panelsList: StoredPanel[] = Array.isArray(data.panels)
      ? data.panels
      : []

    return {
      intent: data.intent,
      layout: panelsList,
      panels: panelsList,
      data: data.data ?? undefined,
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
    }
  } catch (err) {
    console.error('[store] Error getting last layout:', err)
    return null
  }
}
