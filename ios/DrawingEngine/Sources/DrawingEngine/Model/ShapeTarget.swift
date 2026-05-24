import Foundation

/// The kind of mark a level asks the child to make. Drives which metrics matter
/// and how stars are weighted.
public enum ShapeKind: String, Sendable, Codable, CaseIterable {
    case line
    case arc
    case circle
    case rectangle
    case triangle
    case spiral
    case zigzag
    case wave
}

/// The ideal mark the child is aiming at. Every target can produce its ideal
/// path as a polyline, which is what scoring compares the stroke against.
public enum ShapeTarget: Sendable, Equatable {
    case line(from: Point2D, to: Point2D)
    case circle(center: Point2D, radius: Double)
    /// Arbitrary path; `closed` joins the last point back to the first.
    case polyline(points: [Point2D], closed: Bool)

    public var isClosed: Bool {
        switch self {
        case .line: return false
        case .circle: return true
        case .polyline(_, let closed): return closed
        }
    }

    /// The ideal path as evenly described points (closed shapes repeat the first point at the end).
    public func idealPath(samples: Int = 128) -> [Point2D] {
        switch self {
        case .line(let a, let b):
            let n = max(2, samples)
            return (0..<n).map { i in
                let t = Double(i) / Double(n - 1)
                return Point2D(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
            }
        case .circle(let center, let radius):
            let n = max(8, samples)
            return (0...n).map { i in
                let angle = 2 * Double.pi * Double(i) / Double(n)
                return Point2D(center.x + radius * cos(angle),
                               center.y + radius * sin(angle))
            }
        case .polyline(let points, let closed):
            if closed, let first = points.first { return points + [first] }
            return points
        }
    }

    public var boundingBox: BoundingBox? { BoundingBox.of(idealPath()) }

    /// A stable size used to normalize positional error into a 0–1 score.
    public var characteristicLength: Double {
        max(boundingBox?.diagonal ?? 1, 1e-6)
    }

    // MARK: - Builders for parametric shapes (used by content definitions)

    public static func arc(center: Point2D, radius: Double,
                           startAngle: Double, endAngle: Double, samples: Int = 64) -> ShapeTarget {
        let n = max(2, samples)
        let pts = (0..<n).map { i -> Point2D in
            let t = Double(i) / Double(n - 1)
            let angle = startAngle + (endAngle - startAngle) * t
            return Point2D(center.x + radius * cos(angle), center.y + radius * sin(angle))
        }
        return .polyline(points: pts, closed: false)
    }

    public static func rectangle(_ box: BoundingBox) -> ShapeTarget {
        .polyline(points: [
            Point2D(box.minX, box.minY),
            Point2D(box.maxX, box.minY),
            Point2D(box.maxX, box.maxY),
            Point2D(box.minX, box.maxY)
        ], closed: true)
    }

    public static func triangle(_ a: Point2D, _ b: Point2D, _ c: Point2D) -> ShapeTarget {
        .polyline(points: [a, b, c], closed: true)
    }

    public static func spiral(center: Point2D, startRadius: Double, endRadius: Double,
                              turns: Double, samples: Int = 160) -> ShapeTarget {
        let n = max(2, samples)
        let pts = (0..<n).map { i -> Point2D in
            let t = Double(i) / Double(n - 1)
            let angle = 2 * Double.pi * turns * t
            let radius = startRadius + (endRadius - startRadius) * t
            return Point2D(center.x + radius * cos(angle), center.y + radius * sin(angle))
        }
        return .polyline(points: pts, closed: false)
    }
}
