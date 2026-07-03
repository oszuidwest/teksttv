import { type ThemeName, themes } from './theme'

// Accent container + ticker slot shared by the card-style slides
// (TextSlide, WeatherSlide). Card geometry changes happen here once.
export function SlideShell({
  theme,
  ticker,
  children,
}: {
  theme: ThemeName
  ticker?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute top-[160px] bottom-[112px] left-[134px] flex flex-col gap-[2px] rounded-tl-[42px] rounded-tr-[80px] rounded-bl-[42px] pb-[2px]"
      style={{ backgroundColor: themes[theme].accent, width: '1650px' }}
    >
      {children}
      {ticker && <div className="ml-[2px]">{ticker}</div>}
    </div>
  )
}
