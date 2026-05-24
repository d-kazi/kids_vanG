import Foundation

/// The individual precision sub-scores for one stroke, each in 0...1.
/// A metric that doesn't apply to a shape (e.g. closure for a line) is 1.
public struct PrecisionMetrics: Sendable, Codable, Equatable {
    public var closeness: Double
    public var smoothness: Double
    public var closure: Double
    public var sizeMatch: Double

    public init(closeness: Double, smoothness: Double, closure: Double, sizeMatch: Double) {
        self.closeness = closeness
        self.smoothness = smoothness
        self.closure = closure
        self.sizeMatch = sizeMatch
    }
}

/// Pure functions that turn a stroke + target into precision sub-scores.
/// Comparisons are orientation- and start-point-independent so a circle scores
/// the same no matter where the child began the loop.
public enum PrecisionAnalysis {

    private static let sampleCount = 48

    /// How close the stroke sits to the ideal path (symmetric mean nearest distance).
    public static func closeness(stroke: Stroke, target: ShapeTarget, tolerance: Double) -> Double {
        guard stroke.isDrawable else { return 0 }
        let ideal = target.idealPath(samples: sampleCount)
        let strokePts = Geometry.resample(stroke.points, count: sampleCount)
        let aToB = Geometry.meanNearestDistance(from: strokePts, to: ideal)
        let bToA = Geometry.meanNearestDistance(from: ideal, to: strokePts)
        let error = 0.5 * (aToB + bToA) / target.characteristicLength
        return unitScore(error: error, tolerance: tolerance)
    }

    /// Smoothness from the std-dev of curvature: a steady hand keeps turning rate
    /// even (constant for a circle, ~0 for a line); jitter spikes the variance.
    public static func smoothness(stroke: Stroke, tolerance: Double) -> Double {
        let pts = Geometry.resample(stroke.points, count: 64)
        guard pts.count >= 3 else { return 1 }

        var headings: [Double] = []
        for i in 1..<pts.count {
            let d = pts[i] - pts[i - 1]
            if d.length > 0 { headings.append(atan2(d.y, d.x)) }
        }
        guard headings.count >= 2 else { return 1 }

        var curvature: [Double] = []
        for i in 1..<headings.count {
            curvature.append(Geometry.angleDelta(from: headings[i - 1], to: headings[i]))
        }
        let mean = curvature.reduce(0, +) / Double(curvature.count)
        var variance = 0.0
        for c in curvature { variance += (c - mean) * (c - mean) }
        let std = (variance / Double(curvature.count)).squareRoot()
        return unitScore(error: std, tolerance: tolerance)
    }

    /// For closed targets: how well the loop met its own start. Open targets score 1.
    public static func closure(stroke: Stroke, target: ShapeTarget, tolerance: Double) -> Double {
        guard target.isClosed else { return 1 }
        return unitScore(error: stroke.closureGapFraction, tolerance: tolerance)
    }

    /// How well the stroke's overall size matches the target's.
    public static func sizeMatch(stroke: Stroke, target: ShapeTarget, tolerance: Double) -> Double {
        guard let strokeBox = stroke.boundingBox,
              let targetBox = target.boundingBox,
              targetBox.diagonal > 0 else { return 1 }
        let error = abs(strokeBox.diagonal - targetBox.diagonal) / targetBox.diagonal
        return unitScore(error: error, tolerance: tolerance)
    }

    public static func metrics(stroke: Stroke, target: ShapeTarget, tolerances: Tolerances) -> PrecisionMetrics {
        PrecisionMetrics(
            closeness: closeness(stroke: stroke, target: target, tolerance: tolerances.closeness),
            smoothness: smoothness(stroke: stroke, tolerance: tolerances.smoothness),
            closure: closure(stroke: stroke, target: target, tolerance: tolerances.closure),
            sizeMatch: sizeMatch(stroke: stroke, target: target, tolerance: tolerances.size)
        )
    }
}
