import DrawingEngine

/// Hook for per-child difficulty. Wave 1 keeps scoring tolerances stable so
/// "beat your best" stays meaningful; tightening targets as mastery grows is
/// the next increment (PRD build-plan step 5). `Tolerances.scaled(by:)` is the
/// lever we'll use.
struct AdaptiveDifficulty {
    func tolerances(for level: LevelDefinition, best: Double?) -> Tolerances {
        level.tolerances
    }
}
