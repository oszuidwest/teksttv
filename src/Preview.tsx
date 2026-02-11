import type { ComponentType } from 'react'
import { useEffect, useRef } from 'react'
import { z } from 'zod'
import type {
  FullScreenSlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'
import { SlideDataSchema } from './types'

function base64ToBytes(base64: string) {
  const binString = atob(base64)
  return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0)
}

interface SlideComponents {
  text: ComponentType<{ content: TextSlideData }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather?: ComponentType<{ content: WeatherSlideData }>
}

interface PreviewProps {
  apiBase: string
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: React.ReactNode }>
}

export default function Preview({ slides, Ticker, Frame }: PreviewProps) {
  const encodedData = new URLSearchParams(window.location.search).get('data')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function resizeViewport() {
      if (containerRef.current) {
        const parentWidth = window.innerWidth
        const scaleFactor = Math.min(parentWidth / 1920, 1)
        containerRef.current.style.transform = `scale(${scaleFactor})`
        containerRef.current.style.transformOrigin = 'top left'
        containerRef.current.style.width = '1920px'
        containerRef.current.style.height = '1080px'

        const newHeight = 1080 * scaleFactor
        window.parent.postMessage({ type: 'resize', height: newHeight }, '*')
      }
    }

    resizeViewport()
    window.addEventListener('resize', resizeViewport)

    return () => {
      window.removeEventListener('resize', resizeViewport)
    }
  }, [])

  if (!encodedData) {
    return <div>Error: No data provided</div>
  }

  try {
    const bytes = base64ToBytes(encodedData)
    const decodedData = new TextDecoder().decode(bytes)
    const parsedData = JSON.parse(decodedData)
    const validatedData = SlideDataSchema.parse(parsedData)

    const TextSlide = slides.text
    const ImageSlide = slides.image
    const WeatherSlide = slides.weather

    let slide: React.ReactNode
    if (validatedData.type === 'text') {
      slide = <TextSlide content={validatedData} />
    } else if (validatedData.type === 'weather' && WeatherSlide) {
      slide = <WeatherSlide content={validatedData} />
    } else {
      slide = <ImageSlide content={validatedData} />
    }

    const content = (
      <>
        {slide}
        <Ticker
          items={[{ message: 'Dit is een preview slide' }]}
          currentIndex={0}
        />
      </>
    )

    return (
      <div ref={containerRef} className="relative h-[1080px] w-[1920px]">
        {Frame ? <Frame>{content}</Frame> : content}
      </div>
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return <div>Validation Error: {error.message}</div>
    }
    if (error instanceof SyntaxError) {
      return <div>JSON Parsing Error: {error.message}</div>
    }
    return <div>Error: Unable to process the provided data</div>
  }
}
