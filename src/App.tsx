import type { ComponentType } from 'react'
import { useCarousel } from './hooks/useCarousel'
import type {
  FullScreenSlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: React.ReactNode }>
  image: ComponentType<{
    content: FullScreenSlideData
    children?: React.ReactNode
  }>
  weather?: ComponentType<{
    content: WeatherSlideData
    children?: React.ReactNode
  }>
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

  const TextSlide = slides.text
  const ImageSlide = slides.image
  const WeatherSlide = slides.weather
  const currentSlideData = slideData[currentSlide] ?? slideData[0]
  if (!currentSlideData) {
    return <div>Loading...</div>
  }

  const tickerElement = (
    <Ticker items={tickerItems} currentIndex={tickerIndex} />
  )

  let slide: React.ReactNode
  if (currentSlideData.type === 'text') {
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
