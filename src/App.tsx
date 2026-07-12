import { useEffect, useState } from 'react'
import { useCarousel } from './hooks/useCarousel'
import {
  type IframeSlideComponent,
  renderSlide,
  type SlideKit,
} from './SlideRenderer'

const INACTIVE_IFRAME_REFRESH_MS = 5 * 60 * 1000

function PersistentIframeSlide({
  component: IframeSlide,
  url,
  active,
}: {
  component: IframeSlideComponent
  url: string
  active: boolean
}) {
  const [refreshEpoch, setRefreshEpoch] = useState(0)

  useEffect(() => {
    if (active) return

    const refreshInterval = setInterval(
      () => setRefreshEpoch((epoch) => epoch + 1),
      INACTIVE_IFRAME_REFRESH_MS,
    )

    return () => clearInterval(refreshInterval)
  }, [active])

  return (
    <div
      className="pointer-events-none"
      style={{ visibility: active ? 'visible' : 'hidden' }}
    >
      <IframeSlide key={refreshEpoch} url={url} active={active} />
    </div>
  )
}

interface AppProps extends SlideKit {
  apiBase: string
  channel?: string
}

function App({ apiBase, channel, slides, Ticker, Frame }: AppProps) {
  const {
    slides: slideData,
    currentSlide,
    tickerItems,
    tickerIndex,
    imagesToPreload,
    iframeUrls,
    paused,
    error,
    navEnabled,
  } = useCarousel({ apiBase, channel })

  if (slideData.length === 0) {
    if (error) {
      return (
        <div className="flex h-[1080px] w-[1920px] items-center justify-center bg-black p-24 text-white">
          <div className="max-w-[1180px] border-red-500 border-l-8 bg-zinc-950 px-12 py-10 shadow-2xl">
            <h1 className="mb-6 font-bold text-6xl">Feed niet beschikbaar</h1>
            <p className="mb-6 break-words text-4xl leading-tight">{error}</p>
            <p className="text-2xl text-zinc-300">
              Controleer de feed-url, channel-parameter, CORS en JSON-output. De
              app probeert automatisch opnieuw te laden.
            </p>
          </div>
        </div>
      )
    }

    return <div>Loading...</div>
  }

  const currentSlideData = slideData[currentSlide] ?? slideData[0]
  if (!currentSlideData) {
    return <div>Loading...</div>
  }

  const IframeSlide = slides.iframe
  const activeIframeUrl =
    currentSlideData.type === 'iframe' ? currentSlideData.url : null

  const tickerElement = (
    <Ticker items={tickerItems} currentIndex={tickerIndex} />
  )

  // Persistent keyed-by-url layer: embeds stay mounted across slide changes
  // so they don't reload when they reappear. The key epoch changes only while
  // a frame is inactive, giving hidden embeds a recovery path after transient
  // browser/network load failures without disrupting the active slide.
  const iframeLayer = IframeSlide
    ? iframeUrls.map((url) => (
        <PersistentIframeSlide
          key={url}
          component={IframeSlide}
          url={url}
          active={url === activeIframeUrl}
        />
      ))
    : null

  const content = (
    <>
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      {/* iframe slides render via the persistent layer only (blank on air
          when the kit has no iframe component) */}
      {currentSlideData.type === 'iframe'
        ? null
        : renderSlide(slides, currentSlideData, tickerElement, currentSlide)}
      {iframeLayer}
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
