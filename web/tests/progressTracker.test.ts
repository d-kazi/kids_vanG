import { describe, expect, it } from 'vitest'
import { makeAttempt, ProgressTracker } from '../src/lib/engine/progressTracker'
import type { PrecisionResult } from '../src/lib/engine/scorer'

function attempt(levelId: string, overall: number) {
  const result: PrecisionResult = {
    metrics: { closeness: overall, smoothness: overall, closure: overall, sizeMatch: overall },
    overall
  }
  return makeAttempt(levelId, result)
}

describe('progress tracker', () => {
  it('first attempt is a new best', () => {
    const t = new ProgressTracker()
    const out = t.record(attempt('L1', 0.7))
    expect(out.isNewBest).toBe(true)
    expect(out.previousBest).toBeNull()
    expect(t.best('L1')).toBe(0.7)
  })

  it('improvement is detected and earns at least two stars', () => {
    const t = new ProgressTracker()
    t.record(attempt('L1', 0.5))
    const improved = t.record(attempt('L1', 0.75))
    expect(improved.isNewBest).toBe(true)
    expect(improved.delta).toBeGreaterThan(0)
    expect(improved.stars).toBeGreaterThanOrEqual(2)
  })

  it('regression preserves the best', () => {
    const t = new ProgressTracker()
    t.record(attempt('L1', 0.8))
    const worse = t.record(attempt('L1', 0.6))
    expect(worse.isNewBest).toBe(false)
    expect(t.best('L1')).toBe(0.8)
  })

  it('a high-quality first attempt earns three stars', () => {
    expect(ProgressTracker.starsFor(0.9, null, true)).toBe(3)
  })

  it('history is reconstructible from a constructor argument', () => {
    const t1 = new ProgressTracker()
    t1.record(attempt('L1', 0.6))
    t1.record(attempt('L1', 0.8))
    const t2 = new ProgressTracker(t1.history)
    expect(t2.best('L1')).toBe(0.8)
  })
})
