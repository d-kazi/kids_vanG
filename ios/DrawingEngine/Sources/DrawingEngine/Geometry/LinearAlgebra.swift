import Foundation

/// Minimal linear algebra needed by the shape fitters.
enum LinearAlgebra {

    /// Solve a 3×3 system `A x = b` via Gauss-Jordan elimination with partial
    /// pivoting. Returns `nil` if the matrix is singular.
    static func solve3x3(_ a: [[Double]], _ b: [Double]) -> [Double]? {
        var m = a
        var v = b

        for i in 0..<3 {
            var pivot = i
            for r in (i + 1)..<3 where abs(m[r][i]) > abs(m[pivot][i]) {
                pivot = r
            }
            if abs(m[pivot][i]) < 1e-12 { return nil }
            if pivot != i {
                m.swapAt(i, pivot)
                v.swapAt(i, pivot)
            }
            for r in 0..<3 where r != i {
                let factor = m[r][i] / m[i][i]
                for c in i..<3 { m[r][c] -= factor * m[i][c] }
                v[r] -= factor * v[i]
            }
        }
        return [v[0] / m[0][0], v[1] / m[1][1], v[2] / m[2][2]]
    }
}
