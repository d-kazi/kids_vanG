import Foundation
import SwiftData
import DrawingEngine

/// SwiftData persistence record for one scored attempt. Kept flat (no nested
/// types) so the schema is simple and stable.
@Model
final class AttemptEntity {
    var levelId: String
    var timestamp: Date
    var overall: Double
    var closeness: Double
    var smoothness: Double
    var closure: Double
    var sizeMatch: Double

    init(levelId: String,
         timestamp: Date,
         overall: Double,
         closeness: Double,
         smoothness: Double,
         closure: Double,
         sizeMatch: Double) {
        self.levelId = levelId
        self.timestamp = timestamp
        self.overall = overall
        self.closeness = closeness
        self.smoothness = smoothness
        self.closure = closure
        self.sizeMatch = sizeMatch
    }

    convenience init(record: AttemptRecord) {
        let m = record.result.metrics
        self.init(levelId: record.levelId,
                  timestamp: record.timestamp,
                  overall: record.result.overall,
                  closeness: m.closeness,
                  smoothness: m.smoothness,
                  closure: m.closure,
                  sizeMatch: m.sizeMatch)
    }

    var asRecord: AttemptRecord {
        AttemptRecord(
            levelId: levelId,
            timestamp: timestamp,
            result: PrecisionResult(
                metrics: PrecisionMetrics(closeness: closeness,
                                          smoothness: smoothness,
                                          closure: closure,
                                          sizeMatch: sizeMatch),
                overall: overall
            )
        )
    }
}
