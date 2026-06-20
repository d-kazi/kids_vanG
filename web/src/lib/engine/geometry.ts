// 2-D geometry primitives + polyline helpers. Pure, immutable, side-effect-free.

export interface Point2D {
  readonly x: number
  readonly y: number
}

export const ZERO: Point2D = { x: 0, y: 0 }

export const point = (x: number, y: number): Point2D => ({ x, y })

export const add = (a: Point2D, b: Point2D): Point2D => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Point2D, b: Point2D): Point2D => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Point2D, s: number): Point2D => ({ x: a.x * s, y: a.y * s })
export const dot = (a: Point2D, b: Point2D): number => a.x * b.x + a.y * b.y
export const length = (a: Point2D): number => Math.hypot(a.x, a.y)
export const distance = (a: Point2D, b: Point2D): number => Math.hypot(a.x - b.x, a.y - b.y)

export interface BoundingBox {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

export function boundingBox(points: readonly Point2D[]): BoundingBox | null {
  if (points.length === 0) return null
  let minX = points[0].x, minY = points[0].y, maxX = points[0].x, maxY = points[0].y
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

export const bboxWidth = (b: BoundingBox): number => b.maxX - b.minX
export const bboxHeight = (b: BoundingBox): number => b.maxY - b.minY
export const bboxCenter = (b: BoundingBox): Point2D => ({
  x: (b.minX + b.maxX) / 2,
  y: (b.minY + b.maxY) / 2
})
export const bboxDiagonal = (b: BoundingBox): number => Math.hypot(bboxWidth(b), bboxHeight(b))

export function polylineLength(points: readonly Point2D[]): number {
  if (points.length < 2) return 0
  let sum = 0
  for (let i = 1; i < points.length; i++) sum += distance(points[i], points[i - 1])
  return sum
}

/** Resample a polyline into `count` points spaced evenly by arc length. */
export function resample(points: readonly Point2D[], count: number): Point2D[] {
  if (count <= 1 || points.length < 2) return [...points]
  const total = polylineLength(points)
  if (total === 0) return Array.from({ length: count }, () => points[0])
  const step = total / (count - 1)
  const result: Point2D[] = [points[0]]
  let prev = points[0]
  let index = 1
  let remaining = step
  while (index < points.length) {
    const curr = points[index]
    const segment = distance(prev, curr)
    if (segment >= remaining && segment > 0) {
      const t = remaining / segment
      const next: Point2D = {
        x: prev.x + (curr.x - prev.x) * t,
        y: prev.y + (curr.y - prev.y) * t
      }
      result.push(next)
      prev = next
      remaining = step
    } else {
      remaining -= segment
      prev = curr
      index++
    }
  }
  const last = points[points.length - 1]
  while (result.length < count) result.push(last)
  return result.length > count ? result.slice(0, count) : result
}

export function distanceToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const ab = sub(b, a)
  const len2 = dot(ab, ab)
  if (len2 === 0) return distance(p, a)
  let t = dot(sub(p, a), ab) / len2
  t = Math.max(0, Math.min(1, t))
  const projection: Point2D = { x: a.x + ab.x * t, y: a.y + ab.y * t }
  return distance(p, projection)
}

export function distanceToPolyline(p: Point2D, polyline: readonly Point2D[]): number {
  if (polyline.length < 2) {
    return polyline.length === 1 ? distance(p, polyline[0]) : Infinity
  }
  let best = Infinity
  for (let i = 1; i < polyline.length; i++) {
    const d = distanceToSegment(p, polyline[i - 1], polyline[i])
    if (d < best) best = d
  }
  return best
}

export function meanNearestDistance(a: readonly Point2D[], b: readonly Point2D[]): number {
  if (a.length === 0 || b.length < 2) return Infinity
  let sum = 0
  for (const p of a) sum += distanceToPolyline(p, b)
  return sum / a.length
}

export function centroid(points: readonly Point2D[]): Point2D {
  if (points.length === 0) return ZERO
  let sx = 0, sy = 0
  for (const p of points) { sx += p.x; sy += p.y }
  return { x: sx / points.length, y: sy / points.length }
}

/** Shortest signed angle (radians) to rotate heading `from` onto `to`, in [-π, π]. */
export function angleDelta(from: number, to: number): number {
  let d = to - from
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return d
}
