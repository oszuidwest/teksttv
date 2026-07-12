import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { renderSlide, type SlideKit } from './SlideRenderer'
import type { SlideData } from './types'
import { SlideDataSchema } from './types'

function base64ToBytes(base64: string) {
  const binString = atob(base64)
  return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0)
}

function decodeSlide(
  encoded: string,
): { slide: SlideData } | { error: string } {
  try {
    const bytes = base64ToBytes(encoded)
    const decodedData = new TextDecoder().decode(bytes)
    return { slide: SlideDataSchema.parse(JSON.parse(decodedData)) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: `Validation Error: ${error.message}` }
    }
    if (error instanceof SyntaxError) {
      return { error: `JSON Parsing Error: ${error.message}` }
    }
    return { error: 'Error: Unable to process the provided data' }
  }
}

export default function Preview({ slides, Ticker, Frame }: SlideKit) {
  const encodedData = new URLSearchParams(window.location.search).get('data')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function resizeViewport() {
      if (containerRef.current) {
        const scaleFactor = Math.min(window.innerWidth / 1920, 1)
        containerRef.current.style.transform = `scale(${scaleFactor})`
        window.parent.postMessage(
          { type: 'resize', height: 1080 * scaleFactor },
          '*',
        )
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

  const result = decodeSlide(encodedData)
  if ('error' in result) {
    return <div>{result.error}</div>
  }

  // Iframe slides are host-managed (see SlideKit); the preview host renders
  // one active instance directly. Aliased because biome's useIframeTitle
  // mistakes <slides.iframe> for a raw <iframe> element.
  const IframeSlide = slides.iframe
  const content =
    result.slide.type === 'iframe' ? (
      IframeSlide ? (
        <div className="pointer-events-none">
          <IframeSlide url={result.slide.url} active />
        </div>
      ) : (
        <div>Iframe slides worden niet ondersteund door dit thema</div>
      )
    ) : (
      renderSlide(
        slides,
        result.slide,
        <Ticker
          items={[{ message: 'Dit is een preview slide' }]}
          currentIndex={0}
        />,
      )
    )

  return (
    <div
      ref={containerRef}
      className="relative h-[1080px] w-[1920px] origin-top-left"
    >
      {Frame ? <Frame>{content}</Frame> : content}
    </div>
  )
}
