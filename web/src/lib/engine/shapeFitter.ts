import type { Point2D } from './geometry'
import { centroid, distance } from './geometry'
import { solve3x3 } from './linearAlgebra'

export interface FittedCircle {
  readonly center: Point2D
  readonly radius: number
  /** RMS distance from points to the fitted circle. Lower = rounder. */
  readonly rmsResidual: number
}

export interface FittedLine {
  readonly start: Point2D
  readonly end: Point2D
  /** RMS perpendicular distance from points to the fitted line. Lower = straighter. */
  readonly rmsPerpendicular: number
}

/**
 * Algebraic (Kåsa) circle fit: solve x² + y² = A·x + B·y + C in the least-squares
 * sense, then recover center = (A/2, B/2), r = √(C + a² + b²).
 */
export function fitCircle(points: readonly Point2D[]): FittedCircle | null {
  if (points.length < 3) return null
  const n = points.length
  let sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0
  let sxz = 0, syz = 0, sz = 0
  for (const p of points) {
    const z = p.x * p.x + p.y * p.y
    sxx += p.x * p.x; sxy += p.x * p.y; syy += p.y * p.y
    sx += p.x; sy += p.y
    sxz += p.x * z; syz += p.y * z; sz += z
  }
  const matrix = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n]
  ]
  const sol = solve3x3(matrix, [sxz, syz, sz])
  if (!sol) return null
  const a = sol[0] / 2
  const b = sol[1] / 2
  const r2 = sol[2] + a * a + b * b
  if (r2 <= 0) return null
  const radius = Math.sqrt(r2)
  const center: Point2D = { x: a, y: b }
  let sumSq = 0
  for (const p of points) {
    const d = distance(p, center) - radius
    sumSq += d * d
  }
  return { center, radius, rmsResidual: Math.sqrt(sumSq / n) }
}

/** Total-least-squares line fit via PCA. */
export function fitLine(points: readonly Point2D[]): FittedLine | null {
  if (points.length < 2) return null
  const n = points.length
  const c = centroid(points)
  let cxx = 0, cxy = 0, cyy = 0
  for (const p of points) {
    const dx = p.x - c.x, dy = p.y - c.y
    cxx += dx * dx; cxy += dx * dy; cyy += dy * dy
  }
  cxx /= n; cxy /= n; cyy /= n
  const trace = cxx + cyy
  const det = cxx * cyy - cxy * cxy
  const disc = Math.max(0, (trace * trace) / 4 - det)
  const lambda = trace / 2 + Math.sqrt(disc)
  let dx: number, dy: number
  if (Math.abs(cxy) > 1e-12) {
    dx = lambda - cyy
    dy = cxy
  } else if (cxx >= cyy) {
    dx = 1; dy = 0
  } else {
    dx = 0; dy = 1
  }
  const dlen = Math.hypot(dx, dy)
  if (dlen > 0) { dx /= dlen; dy /= dlen } else { dx = 1; dy = 0 }
  const nx = -dy, ny = dx
  let tMin = Infinity, tMax = -Infinity, sumPerpSq = 0
  for (const p of points) {
    const vx = p.x - c.x, vy = p.y - c.y
    const t = vx * dx + vy * dy
    if (t < tMin) tMin = t
    if (t > tMax) tMax = t
    const perp = vx * nx + vy * ny
    sumPerpSq += perp * perp
  }
  const start: Point2D = { x: c.x + dx * tMin, y: c.y + dy * tMin }
  const end: Point2D = { x: c.x + dx * tMax, y: c.y + dy * tMax }
  return { start, end, rmsPerpendicular: Math.sqrt(sumPerpSq / n) }
}
