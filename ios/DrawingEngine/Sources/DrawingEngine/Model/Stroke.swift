import Foundation

/// A single freehand stroke captured from the canvas: an ordered list of points.
public struct Stroke: Sendable, Codable, Equatable {
    public var points: [Point2D]

    public init(points: [Point2D]) {
        self.points = points
    }

    public var isDrawable: Bool { points.count >= 2 }

    public var length: Double { Geometry.polylineLength(points) }

    public var boundingBox: BoundingBox? { BoundingBox.of(points) }

    public var start: Point2D? { points.first }
    public var end: Point2D? { points.last }

    /// Gap between the first and last point, relative to the stroke's length.
    /// A small value means the child closed the loop cleanly.
    public var closureGapFraction: Double {
        guard let s = start, let e = end, length > 0 else { return 1 }
        return s.distance(to: e) / length
    }
}
