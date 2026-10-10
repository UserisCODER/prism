export type DebugEntry = {
  intent: unknown
  layout: unknown
  timestamp: string
}

let lastEntry: DebugEntry | null = null

export function setLastEntry(intent: unknown, layout: unknown) {
  lastEntry = {
    intent,
    layout,
    timestamp: new Date().toISOString(),
  }
}

export function getLastEntry(): DebugEntry | null {
  return lastEntry
}
