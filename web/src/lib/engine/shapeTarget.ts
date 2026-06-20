import type { BoundingBox, Point2D } from './geometry'
import { bboxDiagonal, boundingBox } from './geometry'

export type ShapeKind =
  | 'line' | 'arc' | 'circle' | 'rectangle' | 'triangle' | 'spiral' | 'zigzag' | 'wave'

export type ShapeTarget =
  | { readonly kind: 'line'; readonly from: Point2D; readonly to: Point2D }
  | { readonly kind: 'circle'; readonly center: Point2D; readonly radius: number }
  | { readonly kind: 'polyline'; readonly points: readonly Point2D[]; readonly closed: boolean }

export function isClosed(t: ShapeTarget): boolean {
  switch (t.kind) {
    case 'line': return false
    case 'circle': return true
    case 'polyline': return t.closed
  }
}

/** The ideal mark, sampled as a polyline. Closed shapes repeat the first point at the end. */
export function idealPath(t: ShapeTarget, samples: number = 128): Point2D[] {
  switch (t.kind) {
    case 'line': {
      const n = Math.max(2, samples)
      const out: Point2D[] = []
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1)
        out.push({
          x: t.from.x + (t.to.x - t.from.x) * u,
          y: t.from.y + (t.to.y - t.from.y) * u
        })
      }
      return out
    }
    case 'circle': {
      const n = Math.max(8, samples)
      const out: Point2D[] = []
      for (let i = 0; i <= n; i++) {
        const a = (2 * Math.PI * i) / n
        out.push({
          x: t.center.x + t.radius * Math.cos(a),
          y: t.center.y + t.radius * Math.sin(a)
        })
      }
      return out
    }
    case 'polyline': {
      return t.closed && t.points.length > 0
        ? [...t.points, t.points[0]]
        : [...t.points]
    }
  }
}

export function targetBoundingBox(t: ShapeTarget): BoundingBox | null {
  return boundingBox(idealPath(t))
}

/** A stable size used to normalise positional error to 0..1 scores. */
export function characteristicLength(t: ShapeTarget): number {
  const bb = targetBoundingBox(t)
  return bb ? Math.max(bboxDiagonal(bb), 1e-6) : 1e-6
}

// Builders for parametric shapes (used by content definitions).

export function arc(
  center: Point2D, radius: number, startAngle: number, endAngle: number, samples: number = 64
): ShapeTarget {
  const n = Math.max(2, samples)
  const points: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1)
    const a = startAngle + (endAngle - startAngle) * u
    points.push({ x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) })
  }
  return { kind: 'polyline', points, closed: false }
}

export function rectangle(box: BoundingBox): ShapeTarget {
  return {
    kind: 'polyline',
    closed: true,
    points: [
      { x: box.minX, y: box.minY },
      { x: box.maxX, y: box.minY },
      { x: box.maxX, y: box.maxY },
      { x: box.minX, y: box.maxY }
    ]
  }
}

export function triangle(a: Point2D, b: Point2D, c: Point2D): ShapeTarget {
  return { kind: 'polyline', points: [a, b, c], closed: true }
}

export function spiral(
  center: Point2D, startRadius: number, endRadius: number, turns: number, samples: number = 160
): ShapeTarget {
  const n = Math.max(2, samples)
  const points: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1)
    const a = 2 * Math.PI * turns * u
    const r = startRadius + (endRadius - startRadius) * u
    points.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) })
  }
  return { kind: 'polyline', points, closed: false }
}
