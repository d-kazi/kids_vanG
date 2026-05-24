import Foundation

/// Per-shape weighting of the sub-metrics. Closure only matters for closed
/// shapes; smoothness matters most for curves.
public struct ScoringProfile: Sendable {
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

    public static func `default`(for kind: ShapeKind) -> ScoringProfile {
        switch kind {
        case .line:
            return ScoringProfile(closeness: 0.6, smoothness: 0.4, closure: 0, sizeMatch: 0)
        case .arc, .wave, .spiral, .zigzag:
            return ScoringProfile(closeness: 0.55, smoothness: 0.35, closure: 0, sizeMatch: 0.10)
        case .circle:
            return ScoringProfile(closeness: 0.4, smoothness: 0.25, closure: 0.2, sizeMatch: 0.15)
        case .rectangle, .triangle:
            return ScoringProfile(closeness: 0.5, smoothness: 0.1, closure: 0.25, sizeMatch: 0.15)
        }
    }
}

/// The result of scoring one stroke against its target.
public struct PrecisionResult: Sendable, Codable, Equatable {
    public let metrics: PrecisionMetrics
    /// Weighted overall precision, 0...1 (the "precision meter" value).
    public let overall: Double

    public init(metrics: PrecisionMetrics, overall: Double) {
        self.metrics = metrics
        self.overall = overall
    }
}

/// Turns a stroke + level into a precision result.
public enum PrecisionScorer {

    public static func score(stroke: Stroke,
                             target: ShapeTarget,
                             kind: ShapeKind,
                             tolerances: Tolerances = .standard,
                             profile: ScoringProfile? = nil) -> PrecisionResult {
        let metrics = PrecisionAnalysis.metrics(stroke: stroke, target: target, tolerances: tolerances)
        let weights = profile ?? .default(for: kind)

        let weighted =
            metrics.closeness * weights.closeness +
            metrics.smoothness * weights.smoothness +
            metrics.closure * weights.closure +
            metrics.sizeMatch * weights.sizeMatch
        let totalWeight = weights.closeness + weights.smoothness + weights.closure + weights.sizeMatch
        let overall = totalWeight > 0 ? weighted / totalWeight : 0

        return PrecisionResult(metrics: metrics, overall: overall)
    }

    public static func score(stroke: Stroke, level: LevelDefinition) -> PrecisionResult {
        score(stroke: stroke, target: level.target, kind: level.kind, tolerances: level.tolerances)
    }

    /// Consistency across repeated attempts (the repeatability levels): how
    /// alike the strokes are in shape, after removing position. 1 = identical.
    public static func consistency(strokes: [Stroke]) -> Double {
        let usable = strokes.filter { $0.isDrawable }
        guard usable.count >= 2 else { return 1 }

        // Center each stroke on its centroid so position differences don't count.
        let centered: [[Point2D]] = usable.map { stroke in
            let c = Geometry.centroid(stroke.points)
            let pts = stroke.points.map { Point2D($0.x - c.x, $0.y - c.y) }
            return Geometry.resample(pts, count: 48)
        }
        let avgSize = usable.compactMap { $0.boundingBox?.diagonal }.reduce(0, +)
            / Double(max(1, usable.count))
        guard avgSize > 0 else { return 1 }

        var totalError = 0.0
        var pairs = 0.0
        for i in 0..<centered.count {
            for j in (i + 1)..<centered.count {
                let a = Geometry.meanNearestDistance(from: centered[i], to: centered[j])
                let b = Geometry.meanNearestDistance(from: centered[j], to: centered[i])
                totalError += 0.5 * (a + b)
                pairs += 1
            }
        }
        let meanError = (totalError / pairs) / avgSize
        return unitScore(error: meanError, tolerance: 0.10)
    }
}
