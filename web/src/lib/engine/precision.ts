import { angleDelta, bboxDiagonal, meanNearestDistance, resample } from './geometry'
import { characteristicLength, idealPath, isClosed, type ShapeTarget } from './shapeTarget'
import { closureGapFraction, isDrawable, strokeBoundingBox, type Stroke } from './stroke'
import { type Tolerances, unitScore } from './tolerances'

export interface PrecisionMetrics {
  readonly closeness: number
  readonly smoothness: number
  readonly closure: number
  readonly sizeMatch: number
}

const SAMPLE_COUNT = 48

/** Symmetric mean nearest distance, so a circle scores the same wherever the loop began. */
export function closenessScore(s: Stroke, target: ShapeTarget, tolerance: number): number {
  if (!isDrawable(s)) return 0
  const ideal = idealPath(target, SAMPLE_COUNT)
  const strokePts = resample(s.points, SAMPLE_COUNT)
  const aToB = meanNearestDistance(strokePts, ideal)
  const bToA = meanNearestDistance(ideal, strokePts)
  const error = 0.5 * (aToB + bToA) / characteristicLength(target)
  return unitScore(error, tolerance)
}

/** Curvature variance — steady hands keep turning rate consistent; jitter spikes the std. */
export function smoothnessScore(s: Stroke, tolerance: number): number {
  const pts = resample(s.points, 64)
  if (pts.length < 3) return 1
  const headings: number[] = []
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    if (Math.hypot(dx, dy) > 0) headings.push(Math.atan2(dy, dx))
  }
  if (headings.length < 2) return 1
  const curvature: number[] = []
  for (let i = 1; i < headings.length; i++) {
    curvature.push(angleDelta(headings[i - 1], headings[i]))
  }
  const mean = curvature.reduce((a, b) => a + b, 0) / curvature.length
  let variance = 0
  for (const c of curvature) variance += (c - mean) * (c - mean)
  const std = Math.sqrt(variance / curvature.length)
  return unitScore(std, tolerance)
}

/** Open targets return 1 — closure is not applicable. */
export function closureScore(s: Stroke, target: ShapeTarget, tolerance: number): number {
  if (!isClosed(target)) return 1
  return unitScore(closureGapFraction(s), tolerance)
}

export function sizeMatchScore(s: Stroke, target: ShapeTarget, tolerance: number): number {
  const strokeBB = strokeBoundingBox(s)
  if (!strokeBB) return 1
  const targetDiag = characteristicLength(target)
  if (targetDiag <= 1e-6) return 1
  const error = Math.abs(bboxDiagonal(strokeBB) - targetDiag) / targetDiag
  return unitScore(error, tolerance)
}

export function precisionMetrics(s: Stroke, target: ShapeTarget, t: Tolerances): PrecisionMetrics {
  return {
    closeness: closenessScore(s, target, t.closeness),
    smoothness: smoothnessScore(s, t.smoothness),
    closure: closureScore(s, target, t.closure),
    sizeMatch: sizeMatchScore(s, target, t.size)
  }
}

export function averageMetrics(items: readonly PrecisionMetrics[]): PrecisionMetrics {
  if (items.length === 0) return { closeness: 0, smoothness: 0, closure: 0, sizeMatch: 0 }
  const n = items.length
  let c = 0, sm = 0, cl = 0, sz = 0
  for (const m of items) {
    c += m.closeness; sm += m.smoothness; cl += m.closure; sz += m.sizeMatch
  }
  return { closeness: c / n, smoothness: sm / n, closure: cl / n, sizeMatch: sz / n }
}
