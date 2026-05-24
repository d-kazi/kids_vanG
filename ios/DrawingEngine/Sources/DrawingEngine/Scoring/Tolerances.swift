import Foundation

/// How forgiving scoring is. Each value is the error level that maps to a 0.5
/// sub-score; smaller = stricter. The adaptive engine tightens these as the
/// child improves and loosens them if they struggle.
public struct Tolerances: Sendable, Equatable {
    /// Positional error as a fraction of the target's characteristic length.
    public var closeness: Double
    /// Curvature roughness in radians (std-dev of per-step turning).
    public var smoothness: Double
    /// Closure gap as a fraction of stroke length (closed shapes only).
    public var closure: Double
    /// Size mismatch as a fraction of target size.
    public var size: Double

    public init(closeness: Double, smoothness: Double, closure: Double, size: Double) {
        self.closeness = closeness
        self.smoothness = smoothness
        self.closure = closure
        self.size = size
    }

    public static let standard = Tolerances(
        closeness: 0.06,
        smoothness: 0.18,
        closure: 0.10,
        size: 0.18
    )

    /// Scale toward stricter (factor < 1) or more forgiving (factor > 1).
    public func scaled(by factor: Double) -> Tolerances {
        Tolerances(closeness: closeness * factor,
                   smoothness: smoothness * factor,
                   closure: closure * factor,
                   size: size * factor)
    }
}

/// Maps a non-negative error to a 0–1 score using a smooth falloff that hits
/// 0.5 exactly when `error == tolerance`. Encouraging by design: it never
/// returns a hard zero for a near-miss.
@inline(__always)
func unitScore(error: Double, tolerance: Double) -> Double {
    guard tolerance > 0 else { return error == 0 ? 1 : 0 }
    let ratio = error / tolerance
    return 1.0 / (1.0 + ratio * ratio)
}
