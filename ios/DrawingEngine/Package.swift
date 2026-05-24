// swift-tools-version: 5.9
import PackageDescription

// DrawingEngine: the platform-agnostic core of the Drawing domain.
// Pure Swift (Foundation only) so it builds and unit-tests anywhere; the
// Metal/SwiftUI rendering layer lives in the app target, not here.
let package = Package(
    name: "DrawingEngine",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "DrawingEngine", targets: ["DrawingEngine"])
    ],
    targets: [
        .target(name: "DrawingEngine"),
        .testTarget(
            name: "DrawingEngineTests",
            dependencies: ["DrawingEngine"]
        )
    ]
)
