import { Clock } from '../Clock'

const themes = {
  green: {
    pillBg: '#003500',
    clockStroke: '#42ab33',
  },
  blue: {
    pillBg: '#000035',
    clockStroke: '#0064d7',
  },
} as const

function DateDisplay() {
  const now = new Date()
  const formatted = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return <span>{formatted.charAt(0).toUpperCase() + formatted.slice(1)}</span>
}

export function Header({ theme }: { theme: 'green' | 'blue' }) {
  const c = themes[theme]

  return (
    <div className="absolute top-0 right-0 left-0 z-30 font-nunito">
      {/* Full-width logo bar (1920x160) */}
      <img
        src="/logos/top-bar.svg"
        alt=""
        className="absolute top-0 left-0 h-[160px] w-[1920px]"
      />

      {/* Time pill (dark filled) with clock icon */}
      <div
        className="absolute top-[72px] left-[192px] flex h-[56px] items-center rounded-full pr-[28px] pl-[10px]"
        style={{ backgroundColor: c.pillBg }}
      >
        <svg
          className="mr-[10px] h-[36px] w-[36px]"
          viewBox="0 0 40 40"
          fill="none"
          stroke={c.clockStroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="18" />
          <polyline points="20,10 20,20 12,20" />
        </svg>
        <span className="font-bold text-[38px] text-white leading-none">
          <Clock />
        </span>
      </div>

      {/* Date pill (white outline) */}
      <div className="absolute top-[73px] left-[393px] flex h-[54px] items-center rounded-full border-2 border-white px-[24px]">
        <span className="font-bold text-[38px] text-white leading-none">
          <DateDisplay />
        </span>
      </div>
    </div>
  )
}
