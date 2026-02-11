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
    fetchError,
  } = useCarousel({ apiBase, channel })

  if (slideData.length === 0) {
    return <div>{fetchError ?? 'Loading...'}</div>
  }

  const TextSlide = slides.text
  const ImageSlide = slides.image
  const WeatherSlide = slides.weather
  const currentSlideData = slideData[currentSlide] ?? slideData[0]
  if (!currentSlideData) {
    return <div>{fetchError ?? 'Loading...'}</div>
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
      <ImageSlide key={currentSlide} content={currentSlideData}>
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
      {fetchError && (
        <div className="absolute top-4 left-4 z-50 rounded bg-black/75 px-4 py-2 text-sm text-white">
          {fetchError}
        </div>
      )}
    </div>
  )
}

export default App
