import type { AttemptRecord } from '../lib/engine'

const KEY = 'kidsvang.attempts.v1'

export function loadHistory(): AttemptRecord[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as AttemptRecord[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveAttempt(record: AttemptRecord): void {
  if (typeof localStorage === 'undefined') return
  try {
    const all = loadHistory()
    all.push(record)
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // ignore quota / availability errors
  }
}
