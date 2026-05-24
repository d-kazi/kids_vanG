import XCTest
@testable import DrawingEngine

final class GeometryAndFitTests: XCTestCase {

    func testResampleReturnsRequestedCount() {
        let points = [Point2D(0, 0), Point2D(10, 0), Point2D(10, 10)]
        let resampled = Geometry.resample(points, count: 25)
        XCTAssertEqual(resampled.count, 25)
    }

    func testResampleProducesEvenSpacing() {
        let line = [Point2D(0, 0), Point2D(90, 0)]
        let n = 10
        let resampled = Geometry.resample(line, count: n)
        let expected = 90.0 / Double(n - 1)
        for i in 1..<resampled.count {
            let d = resampled[i].distance(to: resampled[i - 1])
            XCTAssertEqual(d, expected, accuracy: 1e-6)
        }
    }

    func testPolylineLength() {
        let path = [Point2D(0, 0), Point2D(10, 0), Point2D(10, 10), Point2D(0, 10)]
        XCTAssertEqual(Geometry.polylineLength(path), 30, accuracy: 1e-9)
    }

    func testPointToSegmentDistance() {
        let d = Geometry.distance(from: Point2D(5, 5), toSegment: Point2D(0, 0), Point2D(10, 0))
        XCTAssertEqual(d, 5, accuracy: 1e-9)
    }

    func testFitCircleRecoversCenterAndRadius() {
        let points = TestSupport.circlePoints(center: Point2D(300, 400), radius: 100, count: 48)
        let fit = ShapeFitter.fitCircle(points)
        XCTAssertNotNil(fit)
        XCTAssertEqual(fit!.center.x, 300, accuracy: 1e-3)
        XCTAssertEqual(fit!.center.y, 400, accuracy: 1e-3)
        XCTAssertEqual(fit!.radius, 100, accuracy: 1e-3)
        XCTAssertLessThan(fit!.rmsResidual, 1e-3)
    }

    func testFitLineHasLowPerpendicularResidualForCollinearPoints() {
        let points = (0...10).map { Point2D(Double($0), 2 * Double($0)) }   // y = 2x
        let fit = ShapeFitter.fitLine(points)
        XCTAssertNotNil(fit)
        XCTAssertLessThan(fit!.rmsPerpendicular, 1e-6)
    }

    func testFitCircleResidualHigherForWobblyCircle() {
        let clean = TestSupport.circlePoints(center: Point2D(0, 0), radius: 100, count: 48)
        let wobbly = TestSupport.perturbed(clean, amplitude: 15)
        let cleanFit = ShapeFitter.fitCircle(clean)!
        let wobblyFit = ShapeFitter.fitCircle(wobbly)!
        XCTAssertLessThan(cleanFit.rmsResidual, wobblyFit.rmsResidual)
    }
}
