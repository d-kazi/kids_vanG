import Foundation
import SwiftData
import DrawingEngine

/// Offline-first persistence for attempts. Reads run at launch to rebuild the
/// child's personal bests; writes happen after each scored attempt.
@MainActor
final class SwiftDataAttemptStore {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func save(_ record: AttemptRecord) {
        context.insert(AttemptEntity(record: record))
        try? context.save()
    }

    func loadHistory() -> [AttemptRecord] {
        let descriptor = FetchDescriptor<AttemptEntity>(
            sortBy: [SortDescriptor(\.timestamp, order: .forward)]
        )
        let entities = (try? context.fetch(descriptor)) ?? []
        return entities.map { $0.asRecord }
    }
}
