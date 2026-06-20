import { describe, expect, it } from 'vitest'
import type { Point2D } from '../src/lib/engine/geometry'
import { fitCircle, fitLine } from '../src/lib/engine/shapeFitter'

function circlePoints(cx: number, cy: number, r: number, n: number, fraction = 1): Point2D[] {
  const out: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * fraction * i) / n
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return out
}

function perturb(pts: readonly Point2D[], amp: number): Point2D[] {
  return pts.map((p, i) => {
    const off = amp * Math.sin(i * 1.7)
    return { x: p.x + off, y: p.y - off }
  })
}

describe('shape fitter', () => {
  it('fitCircle recovers center and radius for a clean circle', () => {
    const pts = circlePoints(300, 400, 100, 48)
    const fit = fitCircle(pts)
    expect(fit).not.toBeNull()
    expect(fit!.center.x).toBeCloseTo(300, 3)
    expect(fit!.center.y).toBeCloseTo(400, 3)
    expect(fit!.radius).toBeCloseTo(100, 3)
    expect(fit!.rmsResidual).toBeLessThan(1e-3)
  })

  it('fitLine has near-zero perpendicular residual for collinear points', () => {
    const pts: Point2D[] = []
    for (let i = 0; i <= 10; i++) pts.push({ x: i, y: 2 * i })
    const fit = fitLine(pts)
    expect(fit).not.toBeNull()
    expect(fit!.rmsPerpendicular).toBeLessThan(1e-6)
  })

  it('fitCircle residual is higher for a wobbly circle', () => {
    const clean = circlePoints(0, 0, 100, 48)
    const wobbly = perturb(clean, 15)
    const cleanFit = fitCircle(clean)!
    const wobblyFit = fitCircle(wobbly)!
    expect(cleanFit.rmsResidual).toBeLessThan(wobblyFit.rmsResidual)
  })
})
