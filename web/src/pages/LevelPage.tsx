import { useEffect } from 'react'
import { DrawingCanvas } from '../components/DrawingCanvas'
import { PrecisionMeter } from '../components/PrecisionMeter'
import { ResultPanel } from '../components/ResultPanel'
import type { Session } from '../state/useSession'

interface Props {
  readonly session: Session
  readonly onClose: () => void
}

export function LevelPage({ session, onClose }: Props) {
  useEffect(() => {
    session.startLevel()
    // We only want to restart when the active level changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.index])

  return (
    <div className="min-h-screen bg-paper p-6 flex flex-col gap-5">
      <header className="flex items-center gap-5 max-w-5xl w-full mx-auto">
        <button
          onClick={onClose}
          className="text-4xl leading-none text-[#bcbcb8] active:scale-95 transition-transform"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex-1">
          <div className="text-xl font-bold text-ink mb-2">{session.currentLevel.title}</div>
          <PrecisionMeter value={session.meterValue} best={session.bestForCurrent} />
        </div>
        {session.repeatProgress && (
          <div className="px-3 py-1.5 rounded-full bg-accent/12 text-accent font-extrabold text-lg">
            {session.repeatProgress}
          </div>
        )}
      </header>

      <div className="relative rounded-3xl bg-white shadow-lg shadow-black/5 overflow-hidden aspect-square max-h-[70vh] w-full max-w-3xl mx-auto">
        <DrawingCanvas
          target={session.currentLevel.target}
          committedStroke={session.committedStroke}
          showComparison={session.showComparison}
          acceptsInput={session.acceptsInput}
          onStrokeBegan={session.strokeBegan}
          onStrokeCompleted={session.strokeCompleted}
        />
      </div>

      <footer className="max-w-3xl w-full mx-auto">
        {session.phase === 'result' && session.lastOutcome ? (
          <ResultPanel
            stars={session.lastOutcome.stars}
            isNewBest={session.lastOutcome.isNewBest}
            hasPreviousBest={session.lastOutcome.previousBest !== null}
            onRetry={session.retry}
            onNext={session.next}
          />
        ) : (
          <p className="text-center text-lg text-ink/70">{session.currentLevel.voicePrompt}</p>
        )}
      </footer>
    </div>
  )
}
