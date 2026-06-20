export interface Tolerances {
  readonly closeness: number
  readonly smoothness: number
  readonly closure: number
  readonly size: number
}

export const STANDARD_TOLERANCES: Tolerances = {
  closeness: 0.06,
  smoothness: 0.18,
  closure: 0.10,
  size: 0.18
}

export function scaledTolerances(t: Tolerances, factor: number): Tolerances {
  return {
    closeness: t.closeness * factor,
    smoothness: t.smoothness * factor,
    closure: t.closure * factor,
    size: t.size * factor
  }
}

/** 0..1 score with a smooth falloff that hits 0.5 exactly when error == tolerance. */
export function unitScore(error: number, tolerance: number): number {
  if (tolerance <= 0) return error === 0 ? 1 : 0
  const r = error / tolerance
  return 1 / (1 + r * r)
}
