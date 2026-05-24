import CoreGraphics
import DrawingEngine

/// Maps between the engine's normalized 0...1000 space and on-screen view
/// coordinates, fitting a centered square into the view's bounds.
struct CanvasMapping {
    let bounds: CGRect
    let canvasSize: CGFloat

    init(bounds: CGRect, canvasSize: CGFloat = CGFloat(WaveOneLevels.canvasSize)) {
        self.bounds = bounds
        self.canvasSize = canvasSize
    }

    var side: CGFloat { min(bounds.width, bounds.height) }
    var originX: CGFloat { bounds.midX - side / 2 }
    var originY: CGFloat { bounds.midY - side / 2 }

    func toView(_ p: Point2D) -> CGPoint {
        CGPoint(x: originX + CGFloat(p.x) / canvasSize * side,
                y: originY + CGFloat(p.y) / canvasSize * side)
    }

    func toNormalized(_ point: CGPoint) -> Point2D {
        guard side > 0 else { return .zero }
        return Point2D(x: Double((point.x - originX) / side * canvasSize),
                       y: Double((point.y - originY) / side * canvasSize))
    }
}
