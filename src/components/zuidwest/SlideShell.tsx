import { type ThemeName, themes } from './theme'

/** Renders shared ZuidWest card geometry; the ticker remains outside the card. */
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
      <div
        className="relative ml-[2px] flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] font-nunito"
        style={{ backgroundColor: themes[theme].surface }}
      >
        {children}
      </div>
      {ticker && <div className="ml-[2px]">{ticker}</div>}
    </div>
  )
}
