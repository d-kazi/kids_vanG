import Foundation

public struct FittedCircle: Sendable, Equatable {
    public let center: Point2D
    public let radius: Double
    /// RMS distance of the points from the fitted circle. Lower = rounder.
    public let rmsResidual: Double
}

public struct FittedLine: Sendable, Equatable {
    public let start: Point2D
    public let end: Point2D
    /// RMS perpendicular distance from the points to the fitted line. Lower = straighter.
    public let rmsPerpendicular: Double
}

/// Fits a freehand stroke to a primitive to extract shape-intrinsic quality
/// (roundness, straightness) independent of where on the canvas it was drawn.
public enum ShapeFitter {

    /// Algebraic (Kåsa) circle fit: solves x² + y² = A·x + B·y + C in the
    /// least-squares sense, then recovers center = (A/2, B/2), r = √(C + a² + b²).
    public static func fitCircle(_ points: [Point2D]) -> FittedCircle? {
        guard points.count >= 3 else { return nil }
        let n = Double(points.count)
        var sxx = 0.0, sxy = 0.0, syy = 0.0, sx = 0.0, sy = 0.0
        var sxz = 0.0, syz = 0.0, sz = 0.0
        for p in points {
            let z = p.x * p.x + p.y * p.y
            sxx += p.x * p.x
            sxy += p.x * p.y
            syy += p.y * p.y
            sx += p.x
            sy += p.y
            sxz += p.x * z
            syz += p.y * z
            sz += z
        }
        let matrix = [[sxx, sxy, sx],
                      [sxy, syy, sy],
                      [sx,  sy,  n]]
        let rhs = [sxz, syz, sz]
        guard let solution = LinearAlgebra.solve3x3(matrix, rhs) else { return nil }

        let a = solution[0] / 2
        let b = solution[1] / 2
        let r2 = solution[2] + a * a + b * b
        guard r2 > 0 else { return nil }
        let radius = r2.squareRoot()
        let center = Point2D(a, b)

        var sumSq = 0.0
        for p in points {
            let d = p.distance(to: center) - radius
            sumSq += d * d
        }
        let rms = (sumSq / n).squareRoot()
        return FittedCircle(center: center, radius: radius, rmsResidual: rms)
    }

    /// Total-least-squares line fit via PCA: the principal eigenvector of the
    /// point covariance is the line direction; endpoints are the extreme projections.
    public static func fitLine(_ points: [Point2D]) -> FittedLine? {
        guard points.count >= 2 else { return nil }
        let n = Double(points.count)
        let centroid = Geometry.centroid(points)

        var cxx = 0.0, cxy = 0.0, cyy = 0.0
        for p in points {
            let dx = p.x - centroid.x
            let dy = p.y - centroid.y
            cxx += dx * dx
            cxy += dx * dy
            cyy += dy * dy
        }
        cxx /= n; cxy /= n; cyy /= n

        let trace = cxx + cyy
        let det = cxx * cyy - cxy * cxy
        let disc = max(0, trace * trace / 4 - det)
        let lambda = trace / 2 + disc.squareRoot()   // larger eigenvalue

        var direction: Point2D
        if abs(cxy) > 1e-12 {
            direction = Point2D(lambda - cyy, cxy)
        } else {
            direction = cxx >= cyy ? Point2D(1, 0) : Point2D(0, 1)
        }
        let dlen = direction.length
        direction = dlen > 0 ? Point2D(direction.x / dlen, direction.y / dlen) : Point2D(1, 0)
        let normal = Point2D(-direction.y, direction.x)

        var tMin = Double.infinity, tMax = -Double.infinity, sumPerpSq = 0.0
        for p in points {
            let v = p - centroid
            let t = v.dot(direction)
            tMin = min(tMin, t)
            tMax = max(tMax, t)
            let perp = v.dot(normal)
            sumPerpSq += perp * perp
        }
        let start = Point2D(centroid.x + direction.x * tMin, centroid.y + direction.y * tMin)
        let end = Point2D(centroid.x + direction.x * tMax, centroid.y + direction.y * tMax)
        let rms = (sumPerpSq / n).squareRoot()
        return FittedLine(start: start, end: end, rmsPerpendicular: rms)
    }
}
