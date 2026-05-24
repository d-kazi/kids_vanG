import SwiftUI
import DrawingEngine

/// The level picker: big, low-text cards showing each "Steady Hand" challenge
/// and the child's best so far.
struct HomeView: View {
    let session: LevelSessionViewModel
    @State private var showLevel = false

    private let columns = [GridItem(.adaptive(minimum: 220), spacing: 20)]

    var body: some View {
        ZStack {
            AppTheme.paper.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Steady Hand")
                        .font(.system(size: 40, weight: .heavy, design: .rounded))
                        .foregroundStyle(AppTheme.ink)
                        .padding(.top, 12)

                    LazyVGrid(columns: columns, spacing: 20) {
                        ForEach(Array(session.levels.enumerated()), id: \.element.id) { pair in
                            LevelCard(level: pair.element,
                                      best: session.bestStars(at: pair.offset)) {
                                session.select(pair.offset)
                                showLevel = true
                            }
                        }
                    }
                }
                .padding(28)
            }
        }
        .fullScreenCover(isPresented: $showLevel) {
            LevelView(session: session) { showLevel = false }
        }
    }
}

private struct LevelCard: View {
    let level: LevelDefinition
    let best: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 14) {
                ShapeThumbnail(target: level.target)
                    .frame(height: 120)
                Text(level.title)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(AppTheme.ink)
                StarsView(count: best, size: 18)
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.card, in: RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
            .shadow(color: AppTheme.cardShadow, radius: 12, y: 6)
        }
        .buttonStyle(.plain)
    }
}

/// A small preview of a level's target shape.
private struct ShapeThumbnail: View {
    let target: ShapeTarget

    var body: some View {
        GeometryReader { geo in
            let map = CanvasMapping(bounds: CGRect(origin: .zero, size: geo.size))
            Path { path in
                let pts = target.idealPath(samples: 120).map { map.toView($0) }
                guard let first = pts.first else { return }
                path.move(to: first)
                for p in pts.dropFirst() { path.addLine(to: p) }
            }
            .stroke(AppTheme.accent.opacity(0.5),
                    style: StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round))
        }
    }
}
