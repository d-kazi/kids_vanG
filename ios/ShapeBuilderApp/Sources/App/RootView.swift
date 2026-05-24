import SwiftUI
import SwiftData
import DrawingEngine

/// Builds the session once a SwiftData context is available, restoring the
/// child's previous attempts so personal bests survive relaunch.
struct RootView: View {
    @Environment(\.modelContext) private var context
    @State private var session: LevelSessionViewModel?

    var body: some View {
        Group {
            if let session {
                HomeView(session: session)
            } else {
                ProgressView()
            }
        }
        .task {
            guard session == nil else { return }
            let store = SwiftDataAttemptStore(context: context)
            let tracker = ProgressTracker(history: store.loadHistory())
            session = LevelSessionViewModel(tracker: tracker, store: store)
        }
    }
}
