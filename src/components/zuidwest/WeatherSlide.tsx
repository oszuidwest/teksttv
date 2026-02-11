import type { WeatherSlideData } from '../../types'
import { tempStyle } from '../../utils/tempColor'

const themes = {
  green: { border: '#82ba26' },
  blue: { border: '#009fe3' },
} as const

// Resolve OWM icon code to local SVG path, with fallback chain:
// exact match (e.g. 09d) → base code (e.g. 09) → generic cloud
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
      className="h-[68px] w-[68px] shrink-0"
      viewBox="0 0 40 40"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />
      <path
        d="M20 10 L20 30 M20 10 L13 17 M20 10 L27 17"
        fill="none"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WeatherSlide({
  content,
  theme = 'green',
  children,
}: {
  content: WeatherSlideData
  theme?: 'green' | 'blue'
  children?: React.ReactNode
}) {
  const c = themes[theme]
  const days = content.days.slice(0, 5)

  // Column widths (must stay consistent between day rows and klimaatgemiddelde)
  const colDay = 'w-[264px]'
  const colIcon = 'w-[120px]'
  const colMax = 'w-[136px]'
  const colMin = 'w-[136px]'

  return (
    <>
      {/* Green accent flex container */}
      <div
        className="absolute top-[160px] bottom-[112px] left-[134px] flex flex-col gap-[2px] rounded-tl-[42px] rounded-tr-[80px] rounded-bl-[42px] pb-[2px]"
        style={{ backgroundColor: c.border, width: '1650px' }}
      >
        {/* Card */}
        <div className="relative ml-[2px] flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-[#e9e9e9] font-nunito">
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
                  <img
                    src={weatherIconSrc(day.icon)}
                    alt={day.description}
                    className="h-[72px] w-[72px]"
                    onError={(e) => {
                      const img = e.currentTarget
                      const fallback = `/icons/weather/${day.icon.replace(/[dn]$/, '')}.svg`
                      if (img.src !== fallback) img.src = fallback
                    }}
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
                  <WindArrow direction={day.wind_direction} />
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
                  ...tempStyle(6),
                  width: `calc(264px + 120px + 40px + 136px)`,
                }}
              >
                <span className="pl-[24px] font-[600] text-[35px]">
                  klimaatgemiddelde
                </span>
                <div
                  className={`${colMax} ml-auto flex items-center justify-center font-[800] text-[44px]`}
                >
                  6°
                </div>
              </div>

              {/* Right: min avg + rest — colored by low temp */}
              <div className="flex flex-1 items-center" style={tempStyle(1)}>
                <div
                  className={`${colMin} flex items-center justify-center text-[44px]`}
                >
                  1°
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker slot */}
        {children && <div className="ml-[2px]">{children}</div>}
      </div>
    </>
  )
}
