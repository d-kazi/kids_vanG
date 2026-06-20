import { useCallback, useRef, useState } from 'react'
import {
  allLevels, averageMetrics, consistency, type ImprovementOutcome,
  type LevelDefinition, makeAttempt, type PrecisionResult, ProgressTracker,
  score, type Stroke
} from '../lib/engine'
import { speak } from '../services/speech'
import { loadHistory, saveAttempt } from '../services/storage'

export type Phase = 'aim' | 'drawing' | 'result'

export interface Session {
  readonly levels: readonly LevelDefinition[]
  readonly index: number
  readonly phase: Phase
  readonly currentLevel: LevelDefinition
  readonly committedStroke: Stroke | null
  readonly lastResult: PrecisionResult | null
  readonly lastOutcome: ImprovementOutcome | null
  readonly collectedStrokes: readonly Stroke[]
  readonly showComparison: boolean
  readonly acceptsInput: boolean
  readonly bestForCurrent: number | null
  readonly meterValue: number
  readonly repeatProgress: string | null
  bestStars(levelIndex: number): number
  select(levelIndex: number): void
  startLevel(): void
  strokeBegan(): void
  strokeCompleted(stroke: Stroke): void
  retry(): void
  next(): void
}

function starsForBest(best: number | null): number {
  if (best === null) return 0
  if (best >= 0.85) return 3
  if (best >= 0.60) return 2
  return 1
}

export function useSession(): Session {
  const trackerRef = useRef<ProgressTracker | null>(null)
  if (trackerRef.current === null) {
    trackerRef.current = new ProgressTracker(loadHistory())
  }
  const tracker = trackerRef.current

  const [levels] = useState<LevelDefinition[]>(allLevels)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('aim')
  const [committedStroke, setCommittedStroke] = useState<Stroke | null>(null)
  const [lastResult, setLastResult] = useState<PrecisionResult | null>(null)
  const [lastOutcome, setLastOutcome] = useState<ImprovementOutcome | null>(null)
  const [collectedStrokes, setCollectedStrokes] = useState<Stroke[]>([])
  // Force re-render after the tracker's internal map mutates.
  const [, bump] = useState(0)

  const currentLevel = levels[index]
  const showComparison = phase === 'result'
  const acceptsInput = phase !== 'result'
  const bestForCurrent = tracker.best(currentLevel.id)
  const meterValue = lastResult?.overall ?? 0
  const repeatProgress = currentLevel.repeatCount > 1
    ? `${collectedStrokes.length}/${currentLevel.repeatCount}`
    : null

  const select = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(levels.length - 1, i)))
  }, [levels.length])

  const startLevel = useCallback(() => {
    setPhase('aim')
    setCommittedStroke(null)
    setLastResult(null)
    setLastOutcome(null)
    setCollectedStrokes([])
    speak(levels[index].voicePrompt)
  }, [levels, index])

  const strokeBegan = useCallback(() => {
    setPhase(p => p === 'aim' ? 'drawing' : p)
  }, [])

  const finishWithResult = useCallback((result: PrecisionResult, level: LevelDefinition) => {
    const record = makeAttempt(level.id, result)
    const outcome = tracker.record(record)
    saveAttempt(record)
    setLastResult(result)
    setLastOutcome(outcome)
    setPhase('result')
    bump(v => v + 1)
    if (outcome.isNewBest && outcome.previousBest !== null) {
      speak('New best! That was so much better.')
    } else if (outcome.stars >= 3) {
      speak('Beautiful!')
    } else {
      speak('Great try!')
    }
  }, [tracker])

  const strokeCompleted = useCallback((stroke: Stroke) => {
    const level = currentLevel
    if (level.repeatCount > 1) {
      const newCollected = [...collectedStrokes, stroke]
      setCollectedStrokes(newCollected)
      setCommittedStroke(stroke)
      if (newCollected.length < level.repeatCount) {
        speak('Nice! One more the same.')
        return
      }
      const perStroke = newCollected.map(s =>
        score(s, level.target, level.kind, { tolerances: level.tolerances })
      )
      const metrics = averageMetrics(perStroke.map(r => r.metrics))
      const avgOverall = perStroke.reduce((acc, r) => acc + r.overall, 0) / perStroke.length
      const cons = consistency(newCollected)
      // Consistency is the whole point of a repeatability level, so weight it heavily.
      finishWithResult({ metrics, overall: avgOverall * 0.5 + cons * 0.5 }, level)
    } else {
      setCommittedStroke(stroke)
      finishWithResult(
        score(stroke, level.target, level.kind, { tolerances: level.tolerances }),
        level
      )
    }
  }, [currentLevel, collectedStrokes, finishWithResult])

  const retry = useCallback(() => {
    setPhase('aim')
    setCommittedStroke(null)
    setLastResult(null)
    setLastOutcome(null)
    setCollectedStrokes([])
  }, [])

  const next = useCallback(() => {
    setIndex(i => (i + 1) % levels.length)
  }, [levels.length])

  const bestStars = useCallback((i: number) => {
    if (i < 0 || i >= levels.length) return 0
    return starsForBest(tracker.best(levels[i].id))
  }, [levels, tracker])

  return {
    levels, index, phase, currentLevel, committedStroke, lastResult, lastOutcome,
    collectedStrokes, showComparison, acceptsInput, bestForCurrent, meterValue,
    repeatProgress, bestStars, select, startLevel, strokeBegan, strokeCompleted, retry, next
  }
}
