import type { WeatherDay, WeatherSlideData } from '../../types'

/* -------------------------------------------------------------------------
 * BredaNu — Weerbericht slide (1920 × 1080, presentational only).
 *
 * The yellow chevron background and the BredaNu logo come from <Frame>;
 * this component owns just the 1534 × 904 content window at (191, 108).
 * The ticker is plugged in via `children`.
 * ---------------------------------------------------------------------- */

// Temperatuur-heatmap: paars (koud) → blauw → groen → geel → rood (heet).
const TEMP_STOPS: { t: number; c: [number, number, number] }[] = [
  { t: -10, c: [122, 60, 176] }, // paars
  { t: 0, c: [56, 122, 230] }, // blauw
  { t: 7, c: [40, 176, 196] }, // cyaan
  { t: 14, c: [56, 176, 92] }, // groen
  { t: 20, c: [224, 172, 32] }, // geel/amber
  { t: 27, c: [233, 112, 34] }, // oranje
  { t: 35, c: [214, 42, 42] }, // rood
]

function tempRGB(t: number): [number, number, number] {
  const first = TEMP_STOPS[0]
  const last = TEMP_STOPS[TEMP_STOPS.length - 1]
  if (t <= first.t) return first.c
  if (t >= last.t) return last.c
  for (let i = 0; i < TEMP_STOPS.length - 1; i++) {
    const a = TEMP_STOPS[i]
    const b = TEMP_STOPS[i + 1]
    if (t >= a.t && t <= b.t) {
      const f = (t - a.t) / (b.t - a.t)
      return [
        Math.round(a.c[0] + (b.c[0] - a.c[0]) * f),
        Math.round(a.c[1] + (b.c[1] - a.c[1]) * f),
        Math.round(a.c[2] + (b.c[2] - a.c[2]) * f),
      ]
    }
  }
  return last.c
}

const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`

// Zwart of wit op basis van helderheid van de chipkleur.
function inkOn(c: [number, number, number]): string {
  const lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255
  return lum > 0.62 ? '#23211f' : '#ffffff'
}

// Kompasrichting → graden (0 = N, met de klok mee).
const WIND_DEG: Record<WeatherDay['wind_direction'], number> = {
  N: 0,
  NNO: 22.5,
  NO: 45,
  ONO: 67.5,
  O: 90,
  OZO: 112.5,
  ZO: 135,
  ZZO: 157.5,
  Z: 180,
  ZZW: 202.5,
  ZW: 225,
  WZW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
}

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s

function DayCard({ day, isToday }: { day: WeatherDay; isToday: boolean }) {
  const maxC = tempRGB(day.temp_max)
  const minC = tempRGB(day.temp_min)
  const deg = WIND_DEG[day.wind_direction] ?? 0

  return (
    <div
      className={`relative flex h-full flex-col items-center overflow-hidden rounded-[10px] px-[14px] pt-[22px] pb-[20px] ${
        isToday ? 'bg-[#fffbe6]' : 'bg-[#f4f5f6]'
      }`}
      style={isToday ? { boxShadow: 'inset 0 7px 0 0 #fcd800' } : undefined}
    >
      <div className="flex flex-col items-center">
        <div className="font-inter font-semibold text-[#23211f] text-[40px] leading-none">
          {capitalize(day.day_short)}
        </div>
        <div className="mt-[7px] font-bahnschrift text-[#7a7a76] text-[23px] leading-none">
          {day.date.toLowerCase() === day.day_short.toLowerCase()
            ? ' '
            : day.date}
        </div>
      </div>

      <img
        src={`/icons/weather/${day.icon}.svg`}
        alt={day.description}
        width={138}
        height={138}
        className="my-[8px] h-[138px] w-[138px] object-contain"
        onError={(e) => {
          const img = e.currentTarget
          const fallback = `/icons/weather/${day.icon.replace(/[dn]$/, '')}.svg`
          const currentSrc = img.getAttribute('src')
          if (
            img.dataset.fallbackApplied === 'true' ||
            currentSrc === fallback
          ) {
            console.error(
              `Weather icon failed to load, including fallback: ${fallback}`,
            )
            img.dataset.fallbackApplied = 'true'
            return
          }
          console.warn(
            `Weather icon failed to load: ${currentSrc}. Falling back to ${fallback}`,
          )
          img.dataset.fallbackApplied = 'true'
          img.src = fallback
        }}
      />

      <div className="mb-[14px] flex h-[30px] items-center text-center font-bahnschrift text-[#3c3c3a] text-[24px] leading-none">
        {day.description}
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-[10px]">
        <div
          className="flex w-[152px] items-center justify-center rounded-full py-[9px]"
          style={{ backgroundColor: rgb(maxC), color: inkOn(maxC) }}
        >
          <span className="font-bold font-inter text-[54px] tabular-nums leading-none">
            {day.temp_max}°
          </span>
        </div>
        <div
          className="flex w-[120px] items-center justify-center rounded-full py-[6px]"
          style={{ backgroundColor: rgb(minC), color: inkOn(minC) }}
        >
          <span className="font-inter font-semibold text-[34px] tabular-nums leading-none">
            {day.temp_min}°
          </span>
        </div>
      </div>

      <div className="mt-[18px] flex items-center gap-[10px]">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          style={{ transform: `rotate(${deg}deg)` }}
          aria-hidden="true"
        >
          <path d="M12 2.5 L18.5 20 L12 16 L5.5 20 Z" fill="#3c3c3a" />
        </svg>
        <span className="font-bahnschrift text-[#3c3c3a] text-[26px] leading-none">
          {day.wind_direction} · {day.wind_beaufort} Bft
        </span>
      </div>
    </div>
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
    <div className="relative h-full w-full font-bahnschrift text-black">
      <div className="absolute top-[108px] left-[191px] flex h-[904px] w-[1534px] flex-col items-center gap-8">
        <header className="flex h-[112px] w-full shrink-0 items-center justify-between bg-bredanu-gray px-[48px]">
          <h1 className="font-inter font-semibold text-[48px] text-white leading-[1.08]">
            {content.title}
          </h1>
          <div className="flex items-center gap-[14px] text-bredanu-yellow">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2c-3.9 0-7 3.1-7 7 0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="font-inter font-medium text-[31px] leading-none">
              Weerstation {content.location}
            </span>
          </div>
        </header>

        <div className="grid w-full flex-1 grid-cols-5 gap-[20px] bg-white p-[28px]">
          {days.map((day, i) => (
            <DayCard
              key={day.date}
              day={day}
              isToday={day.day_short.toLowerCase() === 'vandaag' || i === 0}
            />
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}
