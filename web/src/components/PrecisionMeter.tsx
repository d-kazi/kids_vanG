interface Props {
  readonly value: number
  readonly best: number | null
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function PrecisionMeter({ value, best }: Props) {
  const v = clamp01(value)
  const b = best === null ? null : clamp01(best)
  return (
    <div
      className="relative h-3.5 w-full overflow-hidden rounded-full bg-[#ebebe8]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label="Precision"
    >
      <div
        className="h-full bg-accent transition-[width] duration-300"
        style={{ width: `${v * 100}%` }}
      />
      {b !== null && (
        <div
          className="absolute top-0 h-full w-[3px] bg-positive"
          style={{ left: `calc(${b * 100}% - 1.5px)` }}
          aria-hidden
        />
      )}
    </div>
  )
}
