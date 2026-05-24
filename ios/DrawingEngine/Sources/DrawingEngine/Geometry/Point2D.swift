import Foundation

/// A 2-D point in canvas coordinates. Deliberately independent of CoreGraphics
/// so the engine core stays portable and unit-testable on any platform.
public struct Point2D: Equatable, Sendable, Codable {
    public var x: Double
    public var y: Double

    public init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }

    public init(_ x: Double, _ y: Double) {
        self.x = x
        self.y = y
    }

    public static let zero = Point2D(0, 0)

    public static func + (a: Point2D, b: Point2D) -> Point2D { Point2D(a.x + b.x, a.y + b.y) }
    public static func - (a: Point2D, b: Point2D) -> Point2D { Point2D(a.x - b.x, a.y - b.y) }
    public static func * (a: Point2D, s: Double) -> Point2D { Point2D(a.x * s, a.y * s) }

    public func dot(_ o: Point2D) -> Double { x * o.x + y * o.y }

    public var length: Double { (x * x + y * y).squareRoot() }

    public func distance(to o: Point2D) -> Double { (self - o).length }
}

/// Axis-aligned bounding box.
public struct BoundingBox: Equatable, Sendable, Codable {
    public var minX, minY, maxX, maxY: Double

    public init(minX: Double, minY: Double, maxX: Double, maxY: Double) {
        self.minX = minX
        self.minY = minY
        self.maxX = maxX
        self.maxY = maxY
    }

    public var width: Double { maxX - minX }
    public var height: Double { maxY - minY }
    public var center: Point2D { Point2D((minX + maxX) / 2, (minY + maxY) / 2) }
    /// Diagonal length — a stable "characteristic size" for normalizing errors.
    public var diagonal: Double { (width * width + height * height).squareRoot() }

    public static func of(_ points: [Point2D]) -> BoundingBox? {
        guard let first = points.first else { return nil }
        var box = BoundingBox(minX: first.x, minY: first.y, maxX: first.x, maxY: first.y)
        for p in points {
            box.minX = min(box.minX, p.x)
            box.minY = min(box.minY, p.y)
            box.maxX = max(box.maxX, p.x)
            box.maxY = max(box.maxY, p.y)
        }
        return box
    }
}
