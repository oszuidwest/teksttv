// Arrow points where the wind blows *to*, so each compass direction maps to
// its opposite bearing (N wind → arrow pointing south = 180°).
const DIR_ROTATION: Record<string, number> = {
  N: 180,
  NNO: 202.5,
  NO: 225,
  ONO: 247.5,
  O: 270,
  OZO: 292.5,
  ZO: 315,
  ZZO: 337.5,
  Z: 0,
  ZZW: 22.5,
  ZW: 45,
  WZW: 67.5,
  W: 90,
  WNW: 112.5,
  NW: 135,
  NNW: 157.5,
}

export function WindArrow({
  direction,
  stroke,
  className,
}: {
  direction: string
  stroke: string
  className?: string
}) {
  const rotation = DIR_ROTATION[direction] ?? 0

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M20 10 L20 30 M20 10 L13 17 M20 10 L27 17"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
