import type { WeatherDay, WeatherSlideData } from '../../types'
import { type ColorStop, interpolateStops } from '../../utils/tempColor'
import { windRotation } from '../../utils/windDirection'
import { WeatherIcon } from '../WeatherIcon'
import { SlideShell } from './SlideShell'

// Temperatuur-heatmap: paars (koud) -> blauw -> groen -> geel -> rood (heet).
const TEMP_STOPS: ColorStop[] = [
  [-10, [122, 60, 176]], // paars
  [0, [56, 122, 230]], // blauw
  [7, [40, 176, 196]], // cyaan
  [14, [56, 176, 92]], // groen
  [20, [224, 172, 32]], // geel/amber
  [27, [233, 112, 34]], // oranje
  [35, [214, 42, 42]], // rood
]

// Zwart of wit op basis van helderheid van de chipkleur.
function tempPill(t: number) {
  const [r, g, b] = interpolateStops(TEMP_STOPS, t)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return {
    backgroundColor: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
    color: lum > 0.62 ? '#23211f' : '#ffffff',
  }
}

function DayCard({ day, isToday }: { day: WeatherDay; isToday: boolean }) {
  // The shared windRotation points downwind; BredaNu's arrow points upwind.
  const deg = (windRotation(day.wind_direction) + 180) % 360

  return (
    <div
      className={`relative flex h-full flex-col items-center overflow-hidden rounded-[10px] px-[14px] pt-[22px] pb-[20px] ${
        isToday ? 'bg-[#fffbe6]' : 'bg-[#f4f5f6]'
      }`}
      style={
        isToday
          ? { boxShadow: 'inset 0 7px 0 0 var(--color-bredanu-yellow)' }
          : undefined
      }
    >
      <div className="flex flex-col items-center">
        <div className="font-inter font-semibold text-[#23211f] text-[40px] capitalize leading-none">
          {day.day_short}
        </div>
        <div className="mt-[7px] font-bahnschrift text-[#7a7a76] text-[23px] leading-none">
          {isToday ? ' ' : day.date}
        </div>
      </div>

      <WeatherIcon
        icon={day.icon}
        alt={day.description}
        className="my-[8px] h-[138px] w-[138px] object-contain"
      />

      <div className="mb-[14px] flex h-[30px] items-center text-center font-bahnschrift text-[24px] text-bredanu-gray leading-none">
        {day.description}
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-[10px]">
        <div
          className="flex w-[152px] items-center justify-center rounded-full py-[9px]"
          style={tempPill(day.temp_max)}
        >
          <span className="font-bold font-inter text-[54px] tabular-nums leading-none">
            {day.temp_max}°
          </span>
        </div>
        <div
          className="flex w-[120px] items-center justify-center rounded-full py-[6px]"
          style={tempPill(day.temp_min)}
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
          <path
            d="M12 2.5 L18.5 20 L12 16 L5.5 20 Z"
            className="fill-bredanu-gray"
          />
        </svg>
        <span className="font-bahnschrift text-[26px] text-bredanu-gray leading-none">
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
    <SlideShell className="font-bahnschrift text-black">
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
            isToday={i === 0 || day.day_short === 'vandaag'}
          />
        ))}
      </div>

      {children}
    </SlideShell>
  )
}
