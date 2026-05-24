import SwiftUI
import DrawingEngine

/// The play screen: a whiteboard canvas with the faint target, plus the
/// precision meter and (after a stroke) the honest comparison + stars.
struct LevelView: View {
    let session: LevelSessionViewModel
    let onClose: () -> Void

    var body: some View {
        ZStack {
            AppTheme.paper.ignoresSafeArea()
            VStack(spacing: 18) {
                header
                canvasCard
                footer
                    .frame(maxWidth: 640)
            }
            .padding(28)
        }
        .onAppear { session.startLevel() }
    }

    // MARK: - Header

    private var header: some View {
        HStack(alignment: .center, spacing: 16) {
            Button(action: onClose) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(Color(white: 0.8))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Close")

            VStack(alignment: .leading, spacing: 6) {
                Text(session.currentLevel.title)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundStyle(AppTheme.ink)
                PrecisionMeterView(value: session.meterValue, best: session.bestForCurrent)
            }

            if let progress = session.repeatProgressText {
                Text(progress)
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
                    .foregroundStyle(AppTheme.accent)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(AppTheme.accent.opacity(0.12), in: Capsule())
            }
        }
    }

    // MARK: - Canvas

    private var canvasCard: some View {
        RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
            .fill(AppTheme.card)
            .shadow(color: AppTheme.cardShadow, radius: 16, y: 8)
            .overlay {
                DrawingCanvas(
                    target: session.currentLevel.target,
                    committedStroke: session.committedStroke,
                    showComparison: session.showComparison,
                    acceptsInput: session.acceptsInput,
                    onStrokeBegan: { session.strokeBegan() },
                    onStrokeCompleted: { session.strokeCompleted($0) }
                )
                .padding(24)
            }
            .aspectRatio(1, contentMode: .fit)
    }

    // MARK: - Footer

    @ViewBuilder
    private var footer: some View {
        switch session.phase {
        case .aim, .drawing:
            Text(session.currentLevel.voicePrompt)
                .font(.system(size: 22, weight: .medium, design: .rounded))
                .foregroundStyle(AppTheme.ink.opacity(0.7))
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 120)
        case .result:
            ResultPanel(
                stars: session.lastOutcome?.stars ?? 1,
                isNewBest: session.lastOutcome?.isNewBest ?? false,
                hasPreviousBest: session.lastOutcome?.previousBest != nil,
                onRetry: { session.retry() },
                onNext: { session.next() }
            )
        }
    }
}

private struct ResultPanel: View {
    let stars: Int
    let isNewBest: Bool
    let hasPreviousBest: Bool
    let onRetry: () -> Void
    let onNext: () -> Void

    private var message: String {
        if isNewBest && hasPreviousBest { return "New best!" }
        if stars >= 3 { return "Beautiful!" }
        return "Great try!"
    }

    var body: some View {
        VStack(spacing: 18) {
            StarsView(count: stars)
            Text(message)
                .font(.system(size: 26, weight: .heavy, design: .rounded))
                .foregroundStyle(isNewBest ? AppTheme.positive : AppTheme.ink)
            HStack(spacing: 16) {
                BigButton(title: "Try again", systemImage: "arrow.counterclockwise",
                          tint: Color(white: 0.55), action: onRetry)
                BigButton(title: "Next", systemImage: "arrow.right",
                          tint: AppTheme.accent, action: onNext)
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity)
        .background(AppTheme.card, in: RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
        .shadow(color: AppTheme.cardShadow, radius: 12, y: 6)
    }
}
