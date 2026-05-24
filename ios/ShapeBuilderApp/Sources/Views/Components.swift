import SwiftUI

/// A calm 0...1 precision bar with a marker for the child's personal best.
struct PrecisionMeterView: View {
    let value: Double
    let best: Double?

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color(white: 0.92))
                Capsule()
                    .fill(AppTheme.accent)
                    .frame(width: geo.size.width * clamped(value))
                if let best {
                    Rectangle()
                        .fill(AppTheme.positive)
                        .frame(width: 3)
                        .offset(x: geo.size.width * clamped(best) - 1.5)
                        .accessibilityHidden(true)
                }
            }
        }
        .frame(height: 14)
        .clipShape(Capsule())
        .accessibilityLabel("Precision")
        .accessibilityValue("\(Int(clamped(value) * 100)) percent")
    }

    private func clamped(_ v: Double) -> CGFloat { CGFloat(min(1, max(0, v))) }
}

/// One-to-three stars; filled up to `count`.
struct StarsView: View {
    let count: Int
    var size: CGFloat = 44

    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<3, id: \.self) { i in
                Image(systemName: i < count ? "star.fill" : "star")
                    .font(.system(size: size))
                    .foregroundStyle(i < count ? AppTheme.star : Color(white: 0.85))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(count) of 3 stars")
    }
}

/// A big, friendly tap target for little hands.
struct BigButton: View {
    let title: String
    let systemImage: String
    var tint: Color = AppTheme.accent
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .padding(.vertical, 18)
                .padding(.horizontal, 28)
                .frame(maxWidth: .infinity)
                .background(tint, in: RoundedRectangle(cornerRadius: 22))
                .foregroundStyle(.white)
        }
        .buttonStyle(.plain)
    }
}
