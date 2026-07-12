import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { useCarousel } from './hooks/useCarousel'
import type {
  FullScreenSlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

const INACTIVE_IFRAME_REFRESH_MS = 5 * 60 * 1000

export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

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

export interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: React.ReactNode }>
  image: ComponentType<{
    content: FullScreenSlideData
    children?: React.ReactNode
  }>
  weather?: ComponentType<{
    content: WeatherSlideData
    children?: React.ReactNode
  }>
  // The App host keeps one instance per distinct URL mounted so embeds load
  // once and stay warm; it hides inactive instances, disables pointer
  // interaction, and may remount inactive instances on a slow interval to
  // recover from transient load failures. Preview renders one active
  // instance directly. The component must fill the canvas above the frame
  // chrome (z-40, like full-screen image slides) and must render the frame
  // regardless of `active` — the host handles hiding.
  iframe?: IframeSlideComponent
}

interface AppProps {
  apiBase: string
  channel?: string
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: React.ReactNode }>
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

  const TextSlide = slides.text
  const ImageSlide = slides.image
  const WeatherSlide = slides.weather
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

  let slide: React.ReactNode
  if (currentSlideData.type === 'iframe') {
    // Rendered by the persistent iframe layer.
    slide = null
  } else if (currentSlideData.type === 'text') {
    slide = (
      <TextSlide key={currentSlide} content={currentSlideData}>
        {tickerElement}
      </TextSlide>
    )
  } else if (currentSlideData.type === 'weather' && WeatherSlide) {
    slide = (
      <WeatherSlide key={currentSlide} content={currentSlideData}>
        {tickerElement}
      </WeatherSlide>
    )
  } else {
    slide = (
      <ImageSlide
        key={currentSlide}
        content={currentSlideData as FullScreenSlideData}
      >
        {tickerElement}
      </ImageSlide>
    )
  }

  const content = (
    <>
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      {slide}
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
