import { LevelCard } from '../components/LevelCard'
import type { Session } from '../state/useSession'

interface Props {
  readonly session: Session
  readonly onPlay: (levelIndex: number) => void
}

export function HomePage({ session, onPlay }: Props) {
  return (
    <div className="min-h-screen bg-paper p-8">
      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-5xl font-black text-ink tracking-tight">Steady Hand</h1>
        <p className="text-lg text-ink/60 mt-2">Aim, draw, beat your best.</p>
      </header>
      <div
        className="max-w-5xl mx-auto grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {session.levels.map((level, i) => (
          <LevelCard
            key={level.id}
            level={level}
            stars={session.bestStars(i)}
            onClick={() => onPlay(i)}
          />
        ))}
      </div>
    </div>
  )
}
