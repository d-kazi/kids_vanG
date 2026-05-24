import Foundation

/// The Wave 1 "Steady Hand" precision ladder (Track 1).
/// Geometry is expressed on a normalized 0...1000 canvas; the renderer maps it
/// to the device's drawable area.
public enum WaveOneLevels {

    public static let canvasSize: Double = 1000

    public static let straightLine = LevelDefinition(
        id: "precision.line.1",
        title: "Star to Moon",
        kind: .line,
        target: .line(from: Point2D(200, 500), to: Point2D(800, 500)),
        voicePrompt: "Draw a straight line from the star to the moon!"
    )

    public static let arc = LevelDefinition(
        id: "precision.arc.1",
        title: "Rainbow",
        kind: .arc,
        target: .arc(center: Point2D(500, 650), radius: 300,
                     startAngle: .pi, endAngle: 2 * .pi),
        voicePrompt: "Follow the rainbow with a smooth curve!"
    )

    public static let circle = LevelDefinition(
        id: "precision.circle.1",
        title: "Round Balloon",
        kind: .circle,
        target: .circle(center: Point2D(500, 500), radius: 260),
        voicePrompt: "Draw a round balloon. Try to close it up!"
    )

    public static let repeatCircle = LevelDefinition(
        id: "precision.repeat.circle",
        title: "Three Bubbles",
        kind: .circle,
        target: .circle(center: Point2D(500, 500), radius: 200),
        voicePrompt: "Blow three bubbles the same size!",
        repeatCount: 3
    )

    public static let spiral = LevelDefinition(
        id: "precision.spiral.1",
        title: "Snail Shell",
        kind: .spiral,
        target: .spiral(center: Point2D(500, 500), startRadius: 30, endRadius: 320, turns: 2.5),
        voicePrompt: "Wind the snail's shell round and round!"
    )

    /// The full ladder, in suggested order. First buildable slice = levels 1–3.
    public static let all: [LevelDefinition] = [
        straightLine,
        arc,
        circle,
        repeatCircle,
        spiral
    ]
}
