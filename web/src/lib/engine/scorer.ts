import { bboxDiagonal, centroid, meanNearestDistance, resample } from './geometry'
import { precisionMetrics, type PrecisionMetrics } from './precision'
import type { ShapeKind, ShapeTarget } from './shapeTarget'
import { isDrawable, strokeBoundingBox, type Stroke } from './stroke'
import { STANDARD_TOLERANCES, type Tolerances, unitScore } from './tolerances'

export interface ScoringProfile {
  readonly closeness: number
  readonly smoothness: number
  readonly closure: number
  readonly sizeMatch: number
}

export function defaultProfile(kind: ShapeKind): ScoringProfile {
  switch (kind) {
    case 'line':
      return { closeness: 0.6, smoothness: 0.4, closure: 0, sizeMatch: 0 }
    case 'arc':
    case 'wave':
    case 'spiral':
    case 'zigzag':
      return { closeness: 0.55, smoothness: 0.35, closure: 0, sizeMatch: 0.10 }
    case 'circle':
      return { closeness: 0.4, smoothness: 0.25, closure: 0.2, sizeMatch: 0.15 }
    case 'rectangle':
    case 'triangle':
      return { closeness: 0.5, smoothness: 0.1, closure: 0.25, sizeMatch: 0.15 }
  }
}

export interface PrecisionResult {
  readonly metrics: PrecisionMetrics
  /** Weighted overall precision, 0..1 — the "precision meter" value. */
  readonly overall: number
}

export interface ScoreOptions {
  readonly tolerances?: Tolerances
  readonly profile?: ScoringProfile
}

export function score(
  stroke: Stroke, target: ShapeTarget, kind: ShapeKind, opts: ScoreOptions = {}
): PrecisionResult {
  const t = opts.tolerances ?? STANDARD_TOLERANCES
  const metrics = precisionMetrics(stroke, target, t)
  const w = opts.profile ?? defaultProfile(kind)
  const weighted =
    metrics.closeness * w.closeness +
    metrics.smoothness * w.smoothness +
    metrics.closure * w.closure +
    metrics.sizeMatch * w.sizeMatch
  const totalWeight = w.closeness + w.smoothness + w.closure + w.sizeMatch
  const overall = totalWeight > 0 ? weighted / totalWeight : 0
  return { metrics, overall }
}

/**
 * Cross-attempt consistency for repeatability levels: how alike the strokes are after
 * centering. Position differences are ignored; size differences are penalised because
 * the level explicitly asks for the same shape repeated.
 */
export function consistency(strokes: readonly Stroke[]): number {
  const usable = strokes.filter(isDrawable)
  if (usable.length < 2) return 1
  const centered = usable.map(s => {
    const c = centroid(s.points)
    const recentred = s.points.map(p => ({ x: p.x - c.x, y: p.y - c.y }))
    return resample(recentred, 48)
  })
  let avgSize = 0
  for (const s of usable) {
    const bb = strokeBoundingBox(s)
    if (bb) avgSize += bboxDiagonal(bb)
  }
  avgSize /= usable.length
  if (avgSize === 0) return 1
  let totalError = 0
  let pairs = 0
  for (let i = 0; i < centered.length; i++) {
    for (let j = i + 1; j < centered.length; j++) {
      const a = meanNearestDistance(centered[i], centered[j])
      const b = meanNearestDistance(centered[j], centered[i])
      totalError += 0.5 * (a + b)
      pairs++
    }
  }
  const meanError = (totalError / pairs) / avgSize
  return unitScore(meanError, 0.10)
}
