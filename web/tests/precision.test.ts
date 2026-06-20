import { describe, expect, it } from 'vitest'
import type { Point2D } from '../src/lib/engine/geometry'
import {
  closenessScore, closureScore, smoothnessScore
} from '../src/lib/engine/precision'
import { consistency, score } from '../src/lib/engine/scorer'
import { idealPath, type ShapeTarget } from '../src/lib/engine/shapeTarget'
import type { Stroke } from '../src/lib/engine/stroke'
import { WaveOneLevels } from '../src/lib/engine/waveOneLevels'

function cleanStroke(target: ShapeTarget): Stroke {
  return { points: idealPath(target, 64) }
}

function perturbedStroke(target: ShapeTarget, amp: number): Stroke {
  const pts = idealPath(target, 64)
  return {
    points: pts.map((p, i) => {
      const off = amp * Math.sin(i * 1.7)
      return { x: p.x + off, y: p.y - off }
    })
  }
}

function circlePoints(cx: number, cy: number, r: number, n: number, fraction = 1): Point2D[] {
  const out: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * fraction * i) / n
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return out
}

describe('precision', () => {
  it('clean line scores high closeness', () => {
    const target = WaveOneLevels.straightLine.target
    expect(closenessScore(cleanStroke(target), target, 0.06)).toBeGreaterThan(0.95)
  })

  it('wobbly line scores lower than clean, but never a hard zero', () => {
    const target = WaveOneLevels.straightLine.target
    const cleanScoreVal = closenessScore(cleanStroke(target), target, 0.06)
    const wobblyScoreVal = closenessScore(perturbedStroke(target, 40), target, 0.06)
    expect(wobblyScoreVal).toBeLessThan(cleanScoreVal)
    expect(wobblyScoreVal).toBeGreaterThan(0)
  })

  it('smooth line is smoother than zigzag', () => {
    const smooth: Stroke = {
      points: Array.from({ length: 61 }, (_, i) => ({ x: i * 10, y: 0 }))
    }
    const zigzag: Stroke = {
      points: Array.from({ length: 61 }, (_, i) => ({ x: i * 10, y: i % 2 === 0 ? 0 : 60 }))
    }
    expect(smoothnessScore(smooth, 0.18)).toBeGreaterThan(smoothnessScore(zigzag, 0.18))
  })

  it('closed loop scores higher than open loop', () => {
    const target: ShapeTarget = { kind: 'circle', center: { x: 0, y: 0 }, radius: 100 }
    const closedPts = circlePoints(0, 0, 100, 64)
    closedPts.push(closedPts[0])
    const closed: Stroke = { points: closedPts }
    const open: Stroke = { points: circlePoints(0, 0, 100, 52, 0.8) }
    const closedScoreVal = closureScore(closed, target, 0.10)
    const openScoreVal = closureScore(open, target, 0.10)
    expect(closedScoreVal).toBeGreaterThan(0.9)
    expect(openScoreVal).toBeLessThan(closedScoreVal)
  })

  it('clean circle scores higher than wobbly circle', () => {
    const level = WaveOneLevels.circle
    const cleanResult = score(cleanStroke(level.target), level.target, level.kind)
    const wobblyResult = score(perturbedStroke(level.target, 35), level.target, level.kind)
    expect(cleanResult.overall).toBeGreaterThan(wobblyResult.overall)
    expect(cleanResult.overall).toBeGreaterThan(0.9)
  })

  it('consistency is high for identical shapes', () => {
    const c = circlePoints(500, 500, 200, 60)
    const strokes: Stroke[] = [{ points: c }, { points: c }, { points: c }]
    expect(consistency(strokes)).toBeGreaterThan(0.9)
  })

  it('consistency is low for very different sizes', () => {
    const strokes: Stroke[] = [100, 200, 320].map(r => ({
      points: circlePoints(500, 500, r, 60)
    }))
    expect(consistency(strokes)).toBeLessThan(0.5)
  })
})
