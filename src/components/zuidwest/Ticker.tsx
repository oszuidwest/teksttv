import type { TickerItem } from '../../types'

const themes = {
  green: { arrow: '#82ba26', tickerBg: '#e0eec9' },
  blue: { arrow: '#009fe3', tickerBg: '#bfe7f8' },
} as const

function parseTicker(message: string) {
  const colonIndex = message.indexOf(': ')
  if (colonIndex > 0 && colonIndex < 30) {
    return {
      label: message.slice(0, colonIndex),
      content: message.slice(colonIndex + 2),
    }
  }
  return { label: null, content: message }
}

export function Ticker({
  items,
  currentIndex,
  theme = 'green',
}: {
  items: TickerItem[]
  currentIndex: number
  theme?: 'green' | 'blue'
}) {
  if (items.length === 0) return null

  const c = themes[theme]
  const { label, content } = parseTicker(items[currentIndex].message)

  return (
    <div
      className="flex h-[68px] items-center rounded-bl-[40px] font-nunito"
      style={{ backgroundColor: c.tickerBg }}
    >
      <div className="flex items-center pl-[56px]">
        {label && (
          <span className="font-black text-[40px] text-black leading-none">
            {label}
          </span>
        )}

        {label && (
          <svg
            className="mx-[12px] h-[30px] w-[36px]"
            viewBox="0 0 36 30"
            fill="none"
            stroke={c.arrow}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="0" y1="15" x2="36" y2="15" />
            <polyline points="21,0.4 36,15 21,29.6" />
          </svg>
        )}

        <span className="text-[#1d1d1b] text-[40px] leading-none">
          {content}
        </span>
      </div>
    </div>
  )
}
