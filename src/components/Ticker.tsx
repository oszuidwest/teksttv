import type { TickerItem } from '../types'
import { Clock } from './Clock'

export const Ticker = ({
  items,
  currentIndex,
}: { items: TickerItem[]; currentIndex: number }) => {
  if (items.length === 0) return null

  return (
    <div className="absolute right-0 bottom-[91px] left-0 z-30 flex items-center bg-black font-bold font-tahoma text-[#F7BF19] text-[51px] tracking-wide">
      <span className="grow pl-[121px]">{items[currentIndex].message}</span>
      <div className="relative w-[10px] self-stretch">
        <svg
          className="h-full w-full fill-white"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon points="0,100 100,0 100,100" />
        </svg>
      </div>
      <span className="bg-white pr-[110px] pl-[30px] text-[56px] text-black">
        <Clock />
      </span>
    </div>
  )
}
