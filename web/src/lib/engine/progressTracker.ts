import type { PrecisionResult } from './scorer'

export interface AttemptRecord {
  readonly id: string
  readonly levelId: string
  readonly timestamp: number
  readonly result: PrecisionResult
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // RFC4122-ish fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = (Math.random() * 16) | 0
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function makeAttempt(levelId: string, result: PrecisionResult): AttemptRecord {
  return { id: uuid(), levelId, timestamp: Date.now(), result }
}

export interface ImprovementOutcome {
  readonly isNewBest: boolean
  readonly previousBest: number | null
  readonly currentScore: number
  readonly stars: number
  readonly delta: number
}

/**
 * Tracks per-level personal bests and awards stars.
 *
 * Stars reward improvement vs. the child's own best first, with an absolute quality
 * floor. There is no failing score and no comparison to other children.
 */
export class ProgressTracker {
  private bests = new Map<string, number>()
  private _history: AttemptRecord[] = []

  constructor(history: readonly AttemptRecord[] = []) {
    for (const r of history) this.ingest(r)
  }

  record(r: AttemptRecord): ImprovementOutcome {
    const previousBest = this.bests.get(r.levelId) ?? null
    const isNewBest = previousBest === null ? true : r.result.overall > previousBest
    this.ingest(r)
    return {
      isNewBest,
      previousBest,
      currentScore: r.result.overall,
      stars: ProgressTracker.starsFor(r.result.overall, previousBest, isNewBest),
      delta: r.result.overall - (previousBest ?? 0)
    }
  }

  best(levelId: string): number | null {
    return this.bests.get(levelId) ?? null
  }

  attempts(levelId: string): AttemptRecord[] {
    return this._history.filter(r => r.levelId === levelId)
  }

  get history(): readonly AttemptRecord[] { return this._history }

  private ingest(r: AttemptRecord): void {
    this._history.push(r)
    const current = this.bests.get(r.levelId)
    if (current === undefined || r.result.overall > current) {
      this.bests.set(r.levelId, r.result.overall)
    }
  }

  static starsFor(scoreVal: number, previousBest: number | null, isNewBest: boolean): number {
    let qualityStars: number
    if (scoreVal >= 0.85) qualityStars = 3
    else if (scoreVal >= 0.60) qualityStars = 2
    else qualityStars = 1
    let improvementStars: number
    if (previousBest !== null) {
      if (scoreVal >= previousBest + 0.10) improvementStars = 3
      else if (scoreVal > previousBest) improvementStars = 2
      else improvementStars = 1
    } else {
      improvementStars = isNewBest ? 2 : 1
    }
    return Math.min(3, Math.max(qualityStars, improvementStars))
  }
}
