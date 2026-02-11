import type { WeatherSlideData } from '../../types'
import { tempStyle } from '../../utils/tempColor'

function weatherIconSrc(icon: string): string {
  const base = `/icons/weather/${icon}.svg`
  const fallback = `/icons/weather/${icon.replace(/[dn]$/, '')}.svg`
  return base !== fallback ? base : fallback
}

function WindArrow({ direction }: { direction: string }) {
  const dirMap: Record<string, number> = {
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
  const rotation = dirMap[direction] ?? 0

  return (
    <svg
      className="h-[48px] w-[48px] shrink-0"
      viewBox="0 0 40 40"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M20 10 L20 30 M20 10 L13 17 M20 10 L27 17"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WeatherSlide({
  content,
  children,
}: {
  content: WeatherSlideData
  children?: React.ReactNode
}) {
  const days = content.days.slice(0, 5)

  return (
    <div className="relative h-full w-full bg-[#BBBBBB] font-tahoma">
      {/* Slanted gradient overlay — Rucphen diagonal signature */}
      <svg
        className="absolute inset-0 z-5 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="weatherSlantedGradient"
            x1="0%"
            y1="0%"
            x2="18%"
            y2="0.276%"
          >
            <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#weatherSlantedGradient)" />
      </svg>

      <div className="absolute inset-0 flex flex-col">
        {/* Title bar — matching TextSlide style */}
        <div className="z-20 mt-[92px] flex w-full items-baseline justify-between bg-[#626671] px-[116px] py-[14px]">
          <h1 className="font-bold text-[51px] text-shadow text-white uppercase tracking-wide">
            Weerbericht
          </h1>
          <span className="text-[36px] text-shadow text-white/70">
            Weerstation {content.location}
          </span>
        </div>

        {/* Content area */}
        <div className="relative z-10 mt-[12px] mb-[160px] flex grow flex-col overflow-hidden bg-[#70747D] px-[116px]">
          {/* Weather day rows */}
          <div className="flex flex-1 flex-col justify-center gap-[10px] py-[20px]">
            {days.map((day) => (
              <div
                key={day.date}
                className="relative flex w-full items-center bg-[#5c6069]"
              >
                {/* Day name */}
                <div className="w-[400px] shrink-0 py-[16px] pl-[48px]">
                  <span className="font-bold text-[42px] text-shadow text-white uppercase leading-none">
                    {day.day_short === 'vandaag'
                      ? 'Vandaag'
                      : day.date.split(' ')[0]}
                  </span>
                  {day.day_short !== 'vandaag' && (
                    <span className="mt-[2px] block text-[24px] text-white/60 leading-none">
                      {day.date.split(' ').slice(1).join(' ')}
                    </span>
                  )}
                </div>

                {/* Weather icon + description */}
                <div className="flex w-[380px] shrink-0 items-center gap-[16px]">
                  <img
                    src={weatherIconSrc(day.icon)}
                    alt={day.description}
                    className="h-[80px] w-[80px] shrink-0"
                    onError={(e) => {
                      const img = e.currentTarget
                      const fallback = `/icons/weather/${day.icon.replace(/[dn]$/, '')}.svg`
                      if (img.src !== fallback) img.src = fallback
                    }}
                  />
                  <span className="text-[28px] text-shadow text-white leading-tight">
                    {day.description}
                  </span>
                </div>

                {/* Temperature pills with diagonal edges */}
                <div className="flex shrink-0 items-center gap-[4px]">
                  <div
                    className="flex h-[64px] w-[110px] items-center justify-center font-bold text-[44px] leading-none"
                    style={{
                      ...tempStyle(day.temp_max),
                      clipPath:
                        'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                    }}
                  >
                    {day.temp_max}°
                  </div>
                  <div
                    className="flex h-[64px] w-[110px] items-center justify-center text-[40px] leading-none"
                    style={{
                      ...tempStyle(day.temp_min),
                      clipPath:
                        'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                    }}
                  >
                    {day.temp_min}°
                  </div>
                </div>

                {/* Wind info with diagonal separator */}
                <div className="ml-[12px] flex items-center gap-[14px] pl-[24px]">
                  <svg
                    className="h-[80px] w-[12px] shrink-0"
                    viewBox="0 0 12 80"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="12"
                      y1="0"
                      x2="0"
                      y2="80"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    />
                  </svg>
                  <WindArrow direction={day.wind_direction} />
                  <div className="flex flex-col">
                    <span className="font-bold text-[28px] text-shadow text-white leading-none">
                      {day.wind_direction}
                    </span>
                    <span className="mt-[4px] text-[24px] text-white/70 leading-none">
                      {day.wind_beaufort} Bft
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
