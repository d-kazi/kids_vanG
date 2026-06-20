interface Props {
  readonly count: number
  readonly size?: number
}

export function Stars({ count, size = 40 }: Props) {
  return (
    <div className="flex gap-2" aria-label={`${count} of 3 stars`} role="img">
      {[0, 1, 2].map(i => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={i < count ? 'fill-star' : 'fill-[#dcdcdc]'}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}
