import Foundation
@testable import DrawingEngine

enum TestSupport {

    /// A clean stroke that exactly follows a target's ideal path.
    static func cleanStroke(for target: ShapeTarget, samples: Int = 64) -> Stroke {
        Stroke(points: target.idealPath(samples: samples))
    }

    /// A wobbly version of a point list: deterministic (no RNG) so tests are stable.
    static func perturbed(_ points: [Point2D], amplitude: Double) -> [Point2D] {
        points.enumerated().map { index, p in
            let wobble = amplitude * sin(Double(index) * 1.7)
            return Point2D(p.x + wobble, p.y - wobble)
        }
    }

    /// Sample a circle's outline as raw points (does not repeat the first point).
    static func circlePoints(center: Point2D, radius: Double, count: Int, fraction: Double = 1.0) -> [Point2D] {
        (0..<count).map { i in
            let angle = 2 * Double.pi * fraction * Double(i) / Double(count)
            return Point2D(center.x + radius * cos(angle), center.y + radius * sin(angle))
        }
    }
}
