import { useCarousel } from './hooks/useCarousel'
import {
  type FrameComponent,
  renderSlide,
  type SlideComponents,
  type TickerComponent,
} from './SlideRenderer'

interface AppProps {
  apiBase: string
  channel?: string
  slides: SlideComponents
  Ticker: TickerComponent
  Frame?: FrameComponent
}

function App({ apiBase, channel, slides, Ticker, Frame }: AppProps) {
  const {
    slides: slideData,
    currentSlide,
    tickerItems,
    tickerIndex,
    imagesToPreload,
    paused,
    navEnabled,
  } = useCarousel({ apiBase, channel })

  if (slideData.length === 0) {
    return <div>Loading...</div>
  }

  const content = (
    <>
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      {renderSlide(
        slides,
        slideData[currentSlide],
        <Ticker items={tickerItems} currentIndex={tickerIndex} />,
        currentSlide,
      )}
    </>
  )

  return (
    <div className="relative h-[1080px] w-[1920px]">
      {Frame ? <Frame>{content}</Frame> : content}
      {navEnabled && (
        <div className="absolute top-2 right-2 z-50 rounded bg-black/70 px-3 py-1.5 font-mono text-white text-xs">
          {paused ? '⏸' : '▶'} {currentSlide + 1}/{slideData.length}
        </div>
      )}
    </div>
  )
}

export default App
