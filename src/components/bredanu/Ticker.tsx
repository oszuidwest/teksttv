import type { TickerItem } from '../../types'
import { Clock } from '../Clock'

export function Ticker({
  items,
  currentIndex,
}: {
  items: TickerItem[]
  currentIndex: number
}) {
  const message = items?.length > 0 ? items[currentIndex]?.message : ''

  return (
    <div className="flex h-[114px] w-full flex-shrink-0 items-center gap-4 bg-bredanu-gray px-6 font-inter text-white">
      <span className="shrink-0 font-semibold text-[48px] tabular-nums leading-none">
        <Clock />
      </span>
      <span className="shrink-0 font-normal text-[36px] leading-none">|</span>
      <span
        className="min-w-0 flex-1 truncate pt-0.5 font-normal text-[34px] leading-tight"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </div>
  )
}
