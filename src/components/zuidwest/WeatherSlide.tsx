import type { WeatherSlideData } from '../../types'
import { tempStyle } from '../../utils/tempColor'
import { WeatherIcon } from '../WeatherIcon'
import { WindArrow } from '../WindArrow'
import { SlideShell } from './SlideShell'
import type { ThemeName } from './theme'

export function WeatherSlide({
  content,
  theme,
  children,
}: {
  content: WeatherSlideData
  theme: ThemeName
  children?: React.ReactNode
}) {
  const days = content.days.slice(0, 5)
  if (days.length === 0) return null

  const avgMax = Math.round(
    days.reduce((sum, d) => sum + d.temp_max, 0) / days.length,
  )
  const avgMin = Math.round(
    days.reduce((sum, d) => sum + d.temp_min, 0) / days.length,
  )

  // Column widths (must stay consistent between day rows and klimaatgemiddelde)
  const colDay = 'w-[264px]'
  const colIcon = 'w-[120px]'
  const colMax = 'w-[136px]'
  const colMin = 'w-[136px]'

  return (
    <SlideShell theme={theme} ticker={children}>
      {/* Weerstation pill */}
      <div className="absolute top-[20px] right-[56px] flex items-center rounded-full border-2 border-white px-[31px] py-[18px]">
        <img
          src="/icons/weather/weerstation.svg"
          alt=""
          className="mr-[22px] w-[40px]"
          style={{ transform: 'scale(1.8) translate(3px, -1px)' }}
        />
        <span className="font-[600] text-[#1d1d1b] text-[32px] leading-none">
          Weerstation {content.location}
        </span>
      </div>

      {/* Header row */}
      <div className="px-[56px] pt-[36px] pb-[20px]">
        <h1 className="font-black text-[#1d1d1b] text-[58px] leading-[59px]">
          Weer
        </h1>
      </div>

      {/* Weather table */}
      <div className="mx-[56px] mt-[4px] mb-[40px] flex flex-1 flex-col overflow-hidden">
        {days.map((day, i) => (
          <div
            key={day.date}
            className="box-content flex h-[94px] items-stretch text-[36px]"
            style={{
              borderTop: i === 0 ? '2px solid white' : 'none',
              borderBottom: '2px solid white',
            }}
          >
            {/* Day name */}
            <div
              className={`${colDay} flex items-center font-bold text-[#1d1d1b] text-[42px]`}
            >
              {day.day_short === 'vandaag'
                ? day.day_short
                : day.date.split(' ')[0]}
            </div>

            {/* Weather icon */}
            <div
              className={`${colIcon} mr-[40px] flex items-center justify-center`}
            >
              <WeatherIcon
                icon={day.icon}
                alt={day.description}
                className="size-[72px]"
              />
            </div>

            {/* Max temp (green column) */}
            <div
              className={`${colMax} flex items-center justify-center font-[800] text-[44px]`}
              style={tempStyle(day.temp_max)}
            >
              {day.temp_max}°
            </div>

            {/* Min temp (light green column) */}
            <div
              className={`${colMin} flex items-center justify-center text-[44px]`}
              style={tempStyle(day.temp_min)}
            >
              {day.temp_min}°
            </div>

            {/* Wind (blue column) */}
            <div className="flex flex-1 items-center gap-[18px] pl-[35px]">
              <WindArrow
                direction={day.wind_direction}
                stroke="#000"
                className="size-[68px] shrink-0"
              />
              <span className="font-[600] text-[#1d1d1b] text-[32px] leading-none">
                {day.wind_direction}
                <br />
                {day.wind_beaufort}-{day.wind_beaufort + 1} Bft
              </span>
            </div>
          </div>
        ))}

        {/* Klimaatgemiddelde row */}
        <div className="flex flex-1 items-stretch">
          {/* Left: label + max avg — colored by high temp */}
          <div
            className="flex items-center"
            style={{
              ...tempStyle(avgMax),
              width: `calc(264px + 120px + 40px + 136px)`,
            }}
          >
            <span className="pl-[24px] font-[600] text-[35px]">
              klimaatgemiddelde
            </span>
            <div
              className={`${colMax} ml-auto flex items-center justify-center font-[800] text-[44px]`}
            >
              {avgMax}°
            </div>
          </div>

          {/* Right: min avg + rest — colored by low temp */}
          <div className="flex flex-1 items-center" style={tempStyle(avgMin)}>
            <div
              className={`${colMin} flex items-center justify-center text-[44px]`}
            >
              {avgMin}°
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  )
}
