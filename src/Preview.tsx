import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { ImageSlideComponent } from './components/ImageSlideComponent'
import { TextSlideComponent } from './components/TextSlideComponent'
import { Ticker } from './components/Ticker'
import { SlideDataSchema } from './types'

export default function Preview() {
  const [searchParams] = useSearchParams()
  const encodedData = searchParams.get('data')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function resizeViewport() {
      if (containerRef.current) {
        const parentWidth = window.innerWidth
        const scaleFactor = Math.min(parentWidth / 1920, 1) // Limit scale to 1
        containerRef.current.style.transform = `scale(${scaleFactor})`
        containerRef.current.style.transformOrigin = 'top left'
        containerRef.current.style.width = '1920px'
        containerRef.current.style.height = '1080px'

        // Inform the parent window of the new height
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
    const decodedData = atob(encodedData)
    const parsedData = JSON.parse(decodedData)
    const validatedData = SlideDataSchema.parse(parsedData)

    return (
      <div ref={containerRef} className="relative w-[1920px] h-[1080px]">
        {validatedData.type === 'image' ? (
          <ImageSlideComponent content={validatedData} />
        ) : (
          <TextSlideComponent content={validatedData} />
        )}
        <Ticker
          items={[{ message: 'Dit is een preview slide' }]}
          currentIndex={0}
        />
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
