import Foundation

/// Tracks per-level personal bests and history, and awards stars.
///
/// Stars reward *improvement vs. the child's own best* first, with an absolute
/// quality floor so a strong attempt is always celebrated. There is no failing
/// score and no comparison to other children.
public final class ProgressTracker {

    private var bestByLevel: [String: Double] = [:]
    private(set) public var history: [AttemptRecord] = []

    public init(history: [AttemptRecord] = []) {
        for record in history { ingest(record) }
    }

    @discardableResult
    public func record(_ record: AttemptRecord) -> ImprovementOutcome {
        let previousBest = bestByLevel[record.levelId]
        let isNewBest = previousBest.map { record.overall > $0 } ?? true
        ingest(record)

        let stars = Self.stars(score: record.overall,
                               previousBest: previousBest,
                               isNewBest: isNewBest)
        return ImprovementOutcome(isNewBest: isNewBest,
                                  previousBest: previousBest,
                                  currentScore: record.overall,
                                  stars: stars)
    }

    public func best(for levelId: String) -> Double? { bestByLevel[levelId] }

    public func attempts(for levelId: String) -> [AttemptRecord] {
        history.filter { $0.levelId == levelId }
    }

    private func ingest(_ record: AttemptRecord) {
        history.append(record)
        if let current = bestByLevel[record.levelId] {
            bestByLevel[record.levelId] = max(current, record.overall)
        } else {
            bestByLevel[record.levelId] = record.overall
        }
    }

    static func stars(score: Double, previousBest: Double?, isNewBest: Bool) -> Int {
        // Absolute quality floor.
        let qualityStars: Int
        switch score {
        case 0.85...: qualityStars = 3
        case 0.60..<0.85: qualityStars = 2
        default: qualityStars = 1
        }
        // Improvement bonus: a clear new best earns extra encouragement.
        let improvementStars: Int
        if let best = previousBest {
            if score >= best + 0.10 { improvementStars = 3 }
            else if score > best { improvementStars = 2 }
            else { improvementStars = 1 }
        } else {
            improvementStars = isNewBest ? 2 : 1   // first attempt
        }
        return min(3, max(qualityStars, improvementStars))
    }
}
