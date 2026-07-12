import { windRotation } from '../utils/windDirection'

export function WindArrow({
  direction,
  stroke,
  className,
}: {
  direction: string
  stroke: string
  className?: string
}) {
  const rotation = windRotation(direction)

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
