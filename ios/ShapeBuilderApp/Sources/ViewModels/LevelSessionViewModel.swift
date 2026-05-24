import Foundation
import Observation
import DrawingEngine

/// Drives one child's run through the precision levels: aim → compare → retry.
/// Never auto-corrects a stroke; only measures it and celebrates improvement
/// against the child's own best.
@MainActor
@Observable
final class LevelSessionViewModel {

    enum Phase { case aim, drawing, result }

    private(set) var levels: [LevelDefinition]
    private(set) var index: Int = 0
    private(set) var phase: Phase = .aim
    private(set) var committedStroke: Stroke?
    private(set) var lastResult: PrecisionResult?
    private(set) var lastOutcome: ImprovementOutcome?

    /// Strokes collected so far for a repeatability level.
    private(set) var collectedStrokes: [Stroke] = []

    private let tracker: ProgressTracker
    private let speech: SpeechService
    private let haptics: HapticsService
    private let store: SwiftDataAttemptStore?
    private let adaptive: AdaptiveDifficulty

    init(levels: [LevelDefinition] = WaveOneLevels.all,
         tracker: ProgressTracker = ProgressTracker(),
         speech: SpeechService = SpeechService(),
         haptics: HapticsService = HapticsService(),
         store: SwiftDataAttemptStore? = nil,
         adaptive: AdaptiveDifficulty = AdaptiveDifficulty()) {
        self.levels = levels
        self.tracker = tracker
        self.speech = speech
        self.haptics = haptics
        self.store = store
        self.adaptive = adaptive
    }

    // MARK: - Derived state

    var currentLevel: LevelDefinition { levels[index] }
    var showComparison: Bool { phase == .result }
    var acceptsInput: Bool { phase != .result }
    var bestForCurrent: Double? { tracker.best(for: currentLevel.id) }
    var meterValue: Double { lastResult?.overall ?? 0 }

    var repeatProgressText: String? {
        guard currentLevel.isRepeatability else { return nil }
        return "\(collectedStrokes.count)/\(currentLevel.repeatCount)"
    }

    /// Stars to show for a level's stored best (for the home grid).
    func bestStars(at levelIndex: Int) -> Int {
        guard levelIndex >= 0, levelIndex < levels.count,
              let best = tracker.best(for: levels[levelIndex].id) else { return 0 }
        switch best {
        case 0.85...: return 3
        case 0.60..<0.85: return 2
        default: return 1
        }
    }

    // MARK: - Flow

    /// Sets the active level; the level screen's `onAppear` calls `startLevel()`.
    func select(_ levelIndex: Int) {
        index = min(max(0, levelIndex), levels.count - 1)
    }

    func startLevel() {
        phase = .aim
        committedStroke = nil
        lastResult = nil
        lastOutcome = nil
        collectedStrokes = []
        speech.speak(currentLevel.voicePrompt)
    }

    func strokeBegan() {
        if phase == .aim { phase = .drawing }
    }

    func strokeCompleted(_ stroke: Stroke) {
        let level = currentLevel
        let tolerances = adaptive.tolerances(for: level, best: tracker.best(for: level.id))

        if level.isRepeatability {
            collectedStrokes.append(stroke)
            committedStroke = stroke
            if collectedStrokes.count < level.repeatCount {
                speech.speak("Nice! One more the same.")
                return
            }
            finish(with: scoreRepeatability(level: level, tolerances: tolerances), level: level)
        } else {
            committedStroke = stroke
            let result = PrecisionScorer.score(stroke: stroke,
                                               target: level.target,
                                               kind: level.kind,
                                               tolerances: tolerances)
            finish(with: result, level: level)
        }
    }

    func retry() {
        phase = .aim
        committedStroke = nil
        lastResult = nil
        lastOutcome = nil
        collectedStrokes = []
    }

    func next() {
        index = (index + 1) % levels.count
        startLevel()
    }

    // MARK: - Scoring helpers

    private func scoreRepeatability(level: LevelDefinition, tolerances: Tolerances) -> PrecisionResult {
        let perStroke = collectedStrokes.map {
            PrecisionScorer.score(stroke: $0, target: level.target, kind: level.kind, tolerances: tolerances)
        }
        let avgMetrics = PrecisionMetrics.average(perStroke.map(\.metrics))
        let avgOverall = perStroke.map(\.overall).reduce(0, +) / Double(max(1, perStroke.count))
        let consistency = PrecisionScorer.consistency(strokes: collectedStrokes)
        // Consistency is the whole point of a repeatability level, so weight it heavily.
        let overall = avgOverall * 0.5 + consistency * 0.5
        return PrecisionResult(metrics: avgMetrics, overall: overall)
    }

    private func finish(with result: PrecisionResult, level: LevelDefinition) {
        let record = AttemptRecord(levelId: level.id, result: result)
        let outcome = tracker.record(record)
        store?.save(record)

        lastResult = result
        lastOutcome = outcome
        phase = .result

        if outcome.isNewBest && outcome.previousBest != nil {
            haptics.celebrate()
            speech.speak("New best! That was so much better.")
        } else if outcome.stars >= 3 {
            haptics.celebrate()
            speech.speak("Wow, beautiful!")
        } else {
            haptics.tap()
            speech.speak("Great try! Want to go again?")
        }
    }
}

private extension PrecisionMetrics {
    static func average(_ items: [PrecisionMetrics]) -> PrecisionMetrics {
        guard !items.isEmpty else {
            return PrecisionMetrics(closeness: 0, smoothness: 0, closure: 0, sizeMatch: 0)
        }
        let n = Double(items.count)
        return PrecisionMetrics(
            closeness: items.map(\.closeness).reduce(0, +) / n,
            smoothness: items.map(\.smoothness).reduce(0, +) / n,
            closure: items.map(\.closure).reduce(0, +) / n,
            sizeMatch: items.map(\.sizeMatch).reduce(0, +) / n
        )
    }
}
