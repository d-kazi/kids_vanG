import SwiftUI
import DrawingEngine

/// SwiftUI wrapper around the UIKit stroke canvas.
struct DrawingCanvas: UIViewRepresentable {
    let target: ShapeTarget?
    let committedStroke: Stroke?
    let showComparison: Bool
    let acceptsInput: Bool
    var onStrokeBegan: () -> Void = {}
    var onStrokeCompleted: (Stroke) -> Void = { _ in }

    func makeUIView(context: Context) -> StrokeCanvasView {
        let view = StrokeCanvasView()
        apply(to: view)
        return view
    }

    func updateUIView(_ view: StrokeCanvasView, context: Context) {
        apply(to: view)
    }

    private func apply(to view: StrokeCanvasView) {
        view.target = target
        view.committedStroke = committedStroke
        view.showComparison = showComparison
        view.acceptsInput = acceptsInput
        view.onStrokeBegan = onStrokeBegan
        view.onStrokeCompleted = onStrokeCompleted
    }
}
