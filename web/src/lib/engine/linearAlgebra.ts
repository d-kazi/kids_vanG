/** Solve a 3x3 system Ax = b via Gauss-Jordan elimination with partial pivoting. */
export function solve3x3(a: readonly (readonly number[])[], b: readonly number[]): number[] | null {
  const m = a.map(row => [...row])
  const v = [...b]
  for (let i = 0; i < 3; i++) {
    let pivot = i
    for (let r = i + 1; r < 3; r++) {
      if (Math.abs(m[r][i]) > Math.abs(m[pivot][i])) pivot = r
    }
    if (Math.abs(m[pivot][i]) < 1e-12) return null
    if (pivot !== i) {
      ;[m[i], m[pivot]] = [m[pivot], m[i]]
      ;[v[i], v[pivot]] = [v[pivot], v[i]]
    }
    for (let r = 0; r < 3; r++) {
      if (r === i) continue
      const factor = m[r][i] / m[i][i]
      for (let c = i; c < 3; c++) m[r][c] -= factor * m[i][c]
      v[r] -= factor * v[i]
    }
  }
  return [v[0] / m[0][0], v[1] / m[1][1], v[2] / m[2][2]]
}
