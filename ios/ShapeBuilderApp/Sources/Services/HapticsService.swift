import UIKit

/// Light, friendly feedback. UIKit generators keep this robust; richer
/// CoreHaptics patterns for the "beat your best" moment are a planned upgrade.
@MainActor
final class HapticsService {
    func celebrate() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    func tap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
}
