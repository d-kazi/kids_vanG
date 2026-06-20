import { arc, type ShapeKind, type ShapeTarget, spiral } from './shapeTarget'
import { STANDARD_TOLERANCES, type Tolerances } from './tolerances'

export interface LevelDefinition {
  readonly id: string
  readonly title: string
  readonly kind: ShapeKind
  readonly target: ShapeTarget
  readonly voicePrompt: string
  /** > 1 turns this into a repeatability challenge (draw the same shape N times). */
  readonly repeatCount: number
  readonly tolerances: Tolerances
}

function level(
  id: string, title: string, kind: ShapeKind, target: ShapeTarget,
  voicePrompt: string, repeatCount: number = 1
): LevelDefinition {
  return { id, title, kind, target, voicePrompt, repeatCount, tolerances: STANDARD_TOLERANCES }
}

export const CANVAS_SIZE = 1000

/** The Wave 1 "Steady Hand" precision ladder, expressed on a 0..1000 normalised canvas. */
export const WaveOneLevels = {
  CANVAS_SIZE,
  straightLine: level(
    'precision.line.1',
    'Star to Moon',
    'line',
    { kind: 'line', from: { x: 200, y: 500 }, to: { x: 800, y: 500 } },
    'Draw a straight line from the star to the moon!'
  ),
  arc: level(
    'precision.arc.1',
    'Rainbow',
    'arc',
    arc({ x: 500, y: 650 }, 300, Math.PI, 2 * Math.PI),
    'Follow the rainbow with a smooth curve!'
  ),
  circle: level(
    'precision.circle.1',
    'Round Balloon',
    'circle',
    { kind: 'circle', center: { x: 500, y: 500 }, radius: 260 },
    'Draw a round balloon. Try to close it up!'
  ),
  repeatCircle: level(
    'precision.repeat.circle',
    'Three Bubbles',
    'circle',
    { kind: 'circle', center: { x: 500, y: 500 }, radius: 200 },
    'Blow three bubbles the same size!',
    3
  ),
  spiral: level(
    'precision.spiral.1',
    'Snail Shell',
    'spiral',
    spiral({ x: 500, y: 500 }, 30, 320, 2.5),
    "Wind the snail's shell round and round!"
  )
} as const

export const allLevels: LevelDefinition[] = [
  WaveOneLevels.straightLine,
  WaveOneLevels.arc,
  WaveOneLevels.circle,
  WaveOneLevels.repeatCircle,
  WaveOneLevels.spiral
]
