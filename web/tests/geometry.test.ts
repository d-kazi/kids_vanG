import { describe, expect, it } from 'vitest'
import {
  angleDelta, centroid, distance, distanceToSegment, polylineLength, resample
} from '../src/lib/engine/geometry'

describe('geometry', () => {
  it('resample returns the requested count', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]
    expect(resample(pts, 25).length).toBe(25)
  })

  it('resample of a straight line is evenly spaced', () => {
    const r = resample([{ x: 0, y: 0 }, { x: 90, y: 0 }], 10)
    for (let i = 1; i < r.length; i++) {
      expect(distance(r[i], r[i - 1])).toBeCloseTo(10, 5)
    }
  })

  it('polylineLength sums segments', () => {
    expect(
      polylineLength([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }])
    ).toBeCloseTo(30, 9)
  })

  it('distance to segment is perpendicular when projection is inside', () => {
    expect(
      distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })
    ).toBeCloseTo(5, 9)
  })

  it('centroid is the mean', () => {
    const c = centroid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }])
    expect(c.x).toBeCloseTo(4 / 3)
    expect(c.y).toBeCloseTo(4 / 3)
  })

  it('angleDelta wraps to [-π, π]', () => {
    expect(angleDelta(0.1, -0.1)).toBeCloseTo(-0.2)
    expect(Math.abs(angleDelta(0.1, 0.1 + 2 * Math.PI))).toBeLessThan(1e-9)
  })
})
