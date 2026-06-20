import { Stars } from './Stars'

interface Props {
  readonly stars: number
  readonly isNewBest: boolean
  readonly hasPreviousBest: boolean
  readonly onRetry: () => void
  readonly onNext: () => void
}

export function ResultPanel({ stars, isNewBest, hasPreviousBest, onRetry, onNext }: Props) {
  const message = isNewBest && hasPreviousBest
    ? 'New best!'
    : stars >= 3
      ? 'Beautiful!'
      : 'Great try!'

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-black/5 flex flex-col items-center gap-5">
      <Stars count={stars} />
      <p
        className={`text-2xl font-extrabold ${isNewBest && hasPreviousBest ? 'text-positive' : 'text-ink'}`}
      >
        {message}
      </p>
      <div className="flex gap-4 w-full">
        <button
          onClick={onRetry}
          className="flex-1 rounded-2xl bg-[#8a8a87] text-white font-bold py-4 text-lg active:scale-95 transition-transform"
        >
          ↺ Try again
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-accent text-white font-bold py-4 text-lg active:scale-95 transition-transform"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
