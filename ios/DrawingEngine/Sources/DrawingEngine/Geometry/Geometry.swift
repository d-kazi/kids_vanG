import Foundation

/// Stateless polyline geometry helpers used across fitting and scoring.
public enum Geometry {

    /// Total arc length of a polyline.
    public static func polylineLength(_ points: [Point2D]) -> Double {
        guard points.count > 1 else { return 0 }
        var sum = 0.0
        for i in 1..<points.count {
            sum += points[i].distance(to: points[i - 1])
        }
        return sum
    }

    /// Resample a polyline into `count` points spaced evenly by arc length.
    /// This makes two strokes comparable regardless of how fast they were drawn.
    public static func resample(_ points: [Point2D], count: Int) -> [Point2D] {
        guard count > 1, points.count > 1 else { return points }
        let total = polylineLength(points)
        guard total > 0 else { return Array(repeating: points[0], count: count) }

        let step = total / Double(count - 1)
        var result: [Point2D] = [points[0]]
        var prev = points[0]
        var index = 1
        var remaining = step

        while index < points.count {
            let current = points[index]
            let segment = prev.distance(to: current)
            if segment >= remaining && segment > 0 {
                let t = remaining / segment
                let next = Point2D(prev.x + (current.x - prev.x) * t,
                                   prev.y + (current.y - prev.y) * t)
                result.append(next)
                prev = next
                remaining = step
            } else {
                remaining -= segment
                prev = current
                index += 1
            }
        }

        // Guard against floating-point drift so the caller always gets `count` points.
        if result.count < count {
            let last = points[points.count - 1]
            while result.count < count { result.append(last) }
        } else if result.count > count {
            result = Array(result.prefix(count))
        }
        return result
    }

    /// Shortest distance from a point to a line segment.
    public static func distance(from point: Point2D, toSegment a: Point2D, _ b: Point2D) -> Double {
        let ab = b - a
        let len2 = ab.dot(ab)
        if len2 == 0 { return point.distance(to: a) }
        var t = (point - a).dot(ab) / len2
        t = max(0, min(1, t))
        let projection = Point2D(a.x + ab.x * t, a.y + ab.y * t)
        return point.distance(to: projection)
    }

    /// Shortest distance from a point to a polyline.
    public static func distance(from point: Point2D, toPolyline polyline: [Point2D]) -> Double {
        guard polyline.count > 1 else {
            return polyline.first.map { point.distance(to: $0) } ?? .infinity
        }
        var best = Double.infinity
        for i in 1..<polyline.count {
            best = min(best, distance(from: point, toSegment: polyline[i - 1], polyline[i]))
        }
        return best
    }

    /// Mean nearest-neighbour distance from polyline `a` to polyline `b`.
    public static func meanNearestDistance(from a: [Point2D], to b: [Point2D]) -> Double {
        guard !a.isEmpty, b.count > 1 else { return .infinity }
        var sum = 0.0
        for p in a { sum += distance(from: p, toPolyline: b) }
        return sum / Double(a.count)
    }

    public static func centroid(_ points: [Point2D]) -> Point2D {
        guard !points.isEmpty else { return .zero }
        var sx = 0.0, sy = 0.0
        for p in points { sx += p.x; sy += p.y }
        let n = Double(points.count)
        return Point2D(sx / n, sy / n)
    }

    /// Smallest signed angle (radians) to rotate heading `from` onto `to`, in [-π, π].
    public static func angleDelta(from: Double, to: Double) -> Double {
        var d = to - from
        while d > .pi { d -= 2 * .pi }
        while d < -.pi { d += 2 * .pi }
        return d
    }
}
