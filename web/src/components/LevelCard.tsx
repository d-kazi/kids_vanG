import { CANVAS_SIZE, idealPath, type LevelDefinition } from '../lib/engine'
import { Stars } from './Stars'

interface Props {
  readonly level: LevelDefinition
  readonly stars: number
  readonly onClick: () => void
}

export function LevelCard({ level, stars, onClick }: Props) {
  const pts = idealPath(level.target, 80)
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / CANVAS_SIZE) * 100} ${(p.y / CANVAS_SIZE) * 100}`)
    .join(' ')

  return (
    <button
      onClick={onClick}
      className="text-left rounded-3xl bg-white p-5 shadow-md shadow-black/5 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 100 100" className="w-full h-32 mb-3" aria-hidden>
        <path
          d={d}
          stroke="rgba(51,140,242,0.5)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-xl font-bold text-ink mb-2">{level.title}</div>
      <Stars count={stars} size={18} />
    </button>
  )
}
