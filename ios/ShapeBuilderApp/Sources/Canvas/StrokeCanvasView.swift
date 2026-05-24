import UIKit
import DrawingEngine

/// Low-latency finger canvas. Captures coalesced touches for smoothness and
/// renders the faint target guide, the child's ink, and (on result) the ideal
/// path overlaid for honest comparison. It never alters the child's stroke.
///
/// Core Graphics keeps this first build simple and robust; a Metal renderer is
/// the planned performance upgrade for sustained 120 Hz (see PRD §4).
final class StrokeCanvasView: UIView {

    var target: ShapeTarget? { didSet { setNeedsDisplay() } }
    var showComparison: Bool = false { didSet { setNeedsDisplay() } }
    var acceptsInput: Bool = true
    var committedStroke: Stroke? {
        didSet {
            if committedStroke != nil { liveViewPoints = [] }
            setNeedsDisplay()
        }
    }

    var onStrokeBegan: (() -> Void)?
    var onStrokeCompleted: ((Stroke) -> Void)?

    private var liveViewPoints: [CGPoint] = []
    private var isDrawing = false

    override init(frame: CGRect) { super.init(frame: frame); commonInit() }
    required init?(coder: NSCoder) { super.init(coder: coder); commonInit() }

    private func commonInit() {
        backgroundColor = .clear
        isMultipleTouchEnabled = false
        isExclusiveTouch = true
        contentMode = .redraw
    }

    private var mapping: CanvasMapping { CanvasMapping(bounds: bounds) }

    // MARK: - Touch capture

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard acceptsInput, let touch = touches.first else { return }
        isDrawing = true
        committedStroke = nil
        liveViewPoints = [touch.location(in: self)]
        onStrokeBegan?()
        setNeedsDisplay()
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard isDrawing, let touch = touches.first else { return }
        if let coalesced = event?.coalescedTouches(for: touch), !coalesced.isEmpty {
            for c in coalesced { liveViewPoints.append(c.location(in: self)) }
        } else {
            liveViewPoints.append(touch.location(in: self))
        }
        setNeedsDisplay()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        finishStroke()
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        isDrawing = false
        liveViewPoints = []
        setNeedsDisplay()
    }

    private func finishStroke() {
        guard isDrawing else { return }
        isDrawing = false
        let map = mapping
        let normalized = liveViewPoints.map { map.toNormalized($0) }
        let stroke = Stroke(points: normalized)
        if stroke.isDrawable { onStrokeCompleted?(stroke) }
        setNeedsDisplay()
    }

    // MARK: - Rendering

    override func draw(_ rect: CGRect) {
        let map = mapping

        if let target {
            let guidePts = target.idealPath(samples: 160).map { map.toView($0) }
            strokePath(guidePts, color: UIColor(white: 0.85, alpha: 1),
                       width: 12, dotted: true)
        }

        if let committedStroke {
            let pts = committedStroke.points.map { map.toView($0) }
            strokePath(pts, color: inkColor, width: 9, dotted: false)
        } else if liveViewPoints.count > 1 {
            strokePath(liveViewPoints, color: inkColor, width: 9, dotted: false)
        }

        if showComparison, let target {
            let idealPts = target.idealPath(samples: 160).map { map.toView($0) }
            strokePath(idealPts, color: accentColor.withAlphaComponent(0.75),
                       width: 4, dotted: false)
        }
    }

    private let inkColor = UIColor(red: 0.16, green: 0.18, blue: 0.22, alpha: 1)
    private let accentColor = UIColor(red: 0.20, green: 0.55, blue: 0.95, alpha: 1)

    private func strokePath(_ points: [CGPoint], color: UIColor, width: CGFloat, dotted: Bool) {
        guard points.count > 1 else { return }
        let path = UIBezierPath()
        path.lineWidth = width
        path.lineCapStyle = .round
        path.lineJoinStyle = .round
        if dotted { path.setLineDash([0.1, width * 2.2], count: 2, phase: 0) }
        path.move(to: points[0])
        for p in points.dropFirst() { path.addLine(to: p) }
        color.setStroke()
        path.stroke()
    }
}
