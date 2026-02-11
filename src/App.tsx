import type { ComponentType } from 'react'
import { useCarousel } from './hooks/useCarousel'
import type { ImageSlideData, TextSlideData, TickerItem } from './types'

interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: React.ReactNode }>
  image: ComponentType<{ content: ImageSlideData; children?: React.ReactNode }>
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
  } = useCarousel({ apiBase, channel })

  if (slideData.length === 0) {
    return <div>Loading...</div>
  }

  const TextSlide = slides.text
  const ImageSlide = slides.image
  const currentSlideData = slideData[currentSlide]

  const tickerElement = (
    <Ticker items={tickerItems} currentIndex={tickerIndex} />
  )

  const content = (
    <>
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      {currentSlideData.type === 'image' ? (
        <ImageSlide key={currentSlide} content={currentSlideData}>
          {tickerElement}
        </ImageSlide>
      ) : (
        <TextSlide key={currentSlide} content={currentSlideData}>
          {tickerElement}
        </TextSlide>
      )}
    </>
  )

  return (
    <div className="relative h-[1080px] w-[1920px]">
      {Frame ? <Frame>{content}</Frame> : content}
    </div>
  )
}

export default App
