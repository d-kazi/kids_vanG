import Foundation

/// One recorded attempt at a level — the unit of signal capture that feeds the
/// parent app's progress trends.
public struct AttemptRecord: Sendable, Codable, Equatable, Identifiable {
    public let id: UUID
    public let levelId: String
    public let timestamp: Date
    public let result: PrecisionResult

    public init(id: UUID = UUID(),
                levelId: String,
                timestamp: Date = Date(),
                result: PrecisionResult) {
        self.id = id
        self.levelId = levelId
        self.timestamp = timestamp
        self.result = result
    }

    public var overall: Double { result.overall }
}

/// What happened relative to the child's own previous best — the "beat your
/// best" outcome that drives celebration and stars. Never compares to peers.
public struct ImprovementOutcome: Sendable, Equatable {
    public let isNewBest: Bool
    public let previousBest: Double?
    public let currentScore: Double
    public let stars: Int

    public var delta: Double { currentScore - (previousBest ?? 0) }
}
