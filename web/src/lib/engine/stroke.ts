import type { BoundingBox, Point2D } from './geometry'
import { boundingBox, distance, polylineLength } from './geometry'

export interface Stroke {
  readonly points: readonly Point2D[]
}

export const stroke = (points: readonly Point2D[]): Stroke => ({ points })

export const isDrawable = (s: Stroke): boolean => s.points.length >= 2

export const strokeLength = (s: Stroke): number => polylineLength(s.points)

export const strokeBoundingBox = (s: Stroke): BoundingBox | null => boundingBox(s.points)

/** Gap between first and last as a fraction of length. Small = clean closure. */
export function closureGapFraction(s: Stroke): number {
  if (s.points.length < 2) return 1
  const len = strokeLength(s)
  if (len === 0) return 1
  return distance(s.points[0], s.points[s.points.length - 1]) / len
}
