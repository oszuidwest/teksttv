import type { WeatherSlideData } from '../../types'
import { tempStyle } from '../../utils/tempColor'
import { WeatherIcon } from '../WeatherIcon'
import { WindArrow } from '../WindArrow'

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
      {/* Rucphen diagonal signature gradient. */}
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
        <div className="z-20 mt-[92px] flex w-full items-baseline justify-between bg-[#626671] px-[116px] py-[14px]">
          <h1 className="font-bold text-[51px] text-shadow-brand text-white uppercase tracking-wide">
            Weerbericht
          </h1>
          <span className="text-[36px] text-shadow-brand text-white/70">
            Weerstation {content.location}
          </span>
        </div>

        <div className="relative z-10 mt-[12px] mb-[160px] flex grow flex-col overflow-hidden bg-[#70747D] px-[116px]">
          <div className="flex flex-1 flex-col justify-center gap-[10px] py-[20px]">
            {days.map((day) => (
              <div
                key={day.date}
                className="relative flex w-full items-center bg-[#5c6069]"
              >
                <div className="w-[400px] shrink-0 py-[16px] pl-[48px]">
                  <span className="font-bold text-[42px] text-shadow-brand text-white uppercase leading-none">
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

                <div className="flex w-[380px] shrink-0 items-center gap-[16px]">
                  <WeatherIcon
                    icon={day.icon}
                    alt={day.description}
                    className="size-[80px] shrink-0"
                  />
                  <span className="text-[28px] text-shadow-brand text-white leading-tight">
                    {day.description}
                  </span>
                </div>

                {/* Diagonal pills match the Rucphen row geometry. */}
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

                {/* Separator keeps wind info visually tied to the pills. */}
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
                  <WindArrow
                    direction={day.wind_direction}
                    stroke="white"
                    className="size-[48px] shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-[28px] text-shadow-brand text-white leading-none">
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
