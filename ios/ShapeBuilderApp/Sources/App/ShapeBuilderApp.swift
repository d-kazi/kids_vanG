import SwiftUI
import SwiftData

@main
struct ShapeBuilderApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: AttemptEntity.self)
    }
}
