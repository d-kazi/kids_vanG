import SwiftUI

/// Whiteboard-clean palette and spacing. Calm, low-clutter, generous radius.
enum AppTheme {
    static let paper = Color(red: 0.98, green: 0.98, blue: 0.97)
    static let card = Color.white
    static let ink = Color(red: 0.16, green: 0.18, blue: 0.22)
    static let guide = Color(white: 0.85)
    static let accent = Color(red: 0.20, green: 0.55, blue: 0.95)
    static let star = Color(red: 1.0, green: 0.78, blue: 0.20)
    static let positive = Color(red: 0.20, green: 0.72, blue: 0.45)

    static let cornerRadius: CGFloat = 28
    static let cardShadow = Color.black.opacity(0.08)
}

extension Color {
    /// SwiftUI lacks a single-argument grayscale initializer; this adds one.
    init(white: Double) {
        self.init(red: white, green: white, blue: white)
    }
}
