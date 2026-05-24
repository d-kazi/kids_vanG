import Foundation

/// A single precision challenge in the "Steady Hand" (Track 1) ladder.
/// Levels are pure data so new challenges cost no engineering.
public struct LevelDefinition: Sendable, Identifiable {
    public let id: String
    public let title: String
    public let kind: ShapeKind
    public let target: ShapeTarget
    public let voicePrompt: String
    /// >1 turns this into a repeatability challenge (draw the same shape N times).
    public let repeatCount: Int
    public let tolerances: Tolerances

    public init(id: String,
                title: String,
                kind: ShapeKind,
                target: ShapeTarget,
                voicePrompt: String,
                repeatCount: Int = 1,
                tolerances: Tolerances = .standard) {
        self.id = id
        self.title = title
        self.kind = kind
        self.target = target
        self.voicePrompt = voicePrompt
        self.repeatCount = repeatCount
        self.tolerances = tolerances
    }

    public var isRepeatability: Bool { repeatCount > 1 }
}
