import XCTest
@testable import DrawingEngine

final class ScoringAndProgressTests: XCTestCase {

    // MARK: - Closeness

    func testClosenessIsHighForCleanLine() {
        let target = WaveOneLevels.straightLine.target
        let stroke = TestSupport.cleanStroke(for: target)
        let score = PrecisionAnalysis.closeness(stroke: stroke, target: target, tolerance: 0.06)
        XCTAssertGreaterThan(score, 0.95)
    }

    func testWobblyLineScoresLowerThanCleanLine() {
        let target = WaveOneLevels.straightLine.target
        let clean = TestSupport.cleanStroke(for: target)
        let wobbly = Stroke(points: TestSupport.perturbed(clean.points, amplitude: 40))
        let cleanScore = PrecisionAnalysis.closeness(stroke: clean, target: target, tolerance: 0.06)
        let wobblyScore = PrecisionAnalysis.closeness(stroke: wobbly, target: target, tolerance: 0.06)
        XCTAssertLessThan(wobblyScore, cleanScore)
        XCTAssertGreaterThan(wobblyScore, 0)   // never a hard zero for a near-miss
    }

    // MARK: - Smoothness

    func testSmoothLineIsSmootherThanZigzag() {
        let smooth = Stroke(points: (0...60).map { Point2D(Double($0) * 10, 0) })
        let zigzag = Stroke(points: (0...60).map { i in
            Point2D(Double(i) * 10, (i % 2 == 0) ? 0 : 60)
        })
        let smoothScore = PrecisionAnalysis.smoothness(stroke: smooth, tolerance: 0.18)
        let zigzagScore = PrecisionAnalysis.smoothness(stroke: zigzag, tolerance: 0.18)
        XCTAssertGreaterThan(smoothScore, zigzagScore)
    }

    // MARK: - Closure

    func testClosedLoopScoresHigherThanOpenLoop() {
        let target = ShapeTarget.circle(center: Point2D(0, 0), radius: 100)
        let closed = Stroke(points: TestSupport.circlePoints(center: .zero, radius: 100, count: 64) +
                            [TestSupport.circlePoints(center: .zero, radius: 100, count: 64)[0]])
        let open = Stroke(points: TestSupport.circlePoints(center: .zero, radius: 100, count: 52, fraction: 0.8))
        let closedScore = PrecisionAnalysis.closure(stroke: closed, target: target, tolerance: 0.10)
        let openScore = PrecisionAnalysis.closure(stroke: open, target: target, tolerance: 0.10)
        XCTAssertGreaterThan(closedScore, 0.9)
        XCTAssertLessThan(openScore, closedScore)
    }

    func testClosureNotApplicableForOpenTargetReturnsOne() {
        let line = WaveOneLevels.straightLine.target
        let stroke = TestSupport.cleanStroke(for: line)
        XCTAssertEqual(PrecisionAnalysis.closure(stroke: stroke, target: line, tolerance: 0.10), 1)
    }

    // MARK: - Overall scoring

    func testCleanCircleScoresHigherThanWobblyCircle() {
        let level = WaveOneLevels.circle
        let clean = TestSupport.cleanStroke(for: level.target)
        let wobbly = Stroke(points: TestSupport.perturbed(clean.points, amplitude: 35))
        let cleanResult = PrecisionScorer.score(stroke: clean, level: level)
        let wobblyResult = PrecisionScorer.score(stroke: wobbly, level: level)
        XCTAssertGreaterThan(cleanResult.overall, wobblyResult.overall)
        XCTAssertGreaterThan(cleanResult.overall, 0.9)
    }

    // MARK: - Consistency (repeatability levels)

    func testConsistencyHighForIdenticalShapes() {
        let circle = TestSupport.circlePoints(center: Point2D(500, 500), radius: 200, count: 60)
        let strokes = [Stroke(points: circle), Stroke(points: circle), Stroke(points: circle)]
        XCTAssertGreaterThan(PrecisionScorer.consistency(strokes: strokes), 0.9)
    }

    func testConsistencyLowForDifferentSizes() {
        let strokes = [100.0, 200.0, 320.0].map {
            Stroke(points: TestSupport.circlePoints(center: Point2D(500, 500), radius: $0, count: 60))
        }
        XCTAssertLessThan(PrecisionScorer.consistency(strokes: strokes), 0.5)
    }

    // MARK: - ProgressTracker

    func testFirstAttemptIsNewBest() {
        let tracker = ProgressTracker()
        let outcome = tracker.record(makeAttempt(level: "L1", overall: 0.7))
        XCTAssertTrue(outcome.isNewBest)
        XCTAssertNil(outcome.previousBest)
        XCTAssertEqual(tracker.best(for: "L1"), 0.7)
    }

    func testImprovementIsDetectedAndRewarded() {
        let tracker = ProgressTracker()
        tracker.record(makeAttempt(level: "L1", overall: 0.5))
        let improved = tracker.record(makeAttempt(level: "L1", overall: 0.75))
        XCTAssertTrue(improved.isNewBest)
        XCTAssertGreaterThan(improved.delta, 0)
        XCTAssertGreaterThanOrEqual(improved.stars, 2)
    }

    func testRegressionIsNotNewBestButBestIsPreserved() {
        let tracker = ProgressTracker()
        tracker.record(makeAttempt(level: "L1", overall: 0.8))
        let worse = tracker.record(makeAttempt(level: "L1", overall: 0.6))
        XCTAssertFalse(worse.isNewBest)
        XCTAssertEqual(tracker.best(for: "L1"), 0.8)
    }

    func testHighQualityAttemptEarnsThreeStars() {
        let stars = ProgressTracker.stars(score: 0.9, previousBest: nil, isNewBest: true)
        XCTAssertEqual(stars, 3)
    }

    private func makeAttempt(level: String, overall: Double) -> AttemptRecord {
        let metrics = PrecisionMetrics(closeness: overall, smoothness: overall,
                                       closure: overall, sizeMatch: overall)
        return AttemptRecord(levelId: level, result: PrecisionResult(metrics: metrics, overall: overall))
    }
}
