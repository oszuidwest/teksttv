import { useEffect, useRef } from 'react'
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
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Error: Unable to process the provided data',
    }
  }
}

export default function Preview({ slides, Ticker, Frame }: SlideKit) {
  const encodedData = new URLSearchParams(window.location.search).get('data')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastScale = -1
    function resizeViewport() {
      const scaleFactor = Math.min(window.innerWidth / 1920, 1)
      if (scaleFactor === lastScale || !containerRef.current) {
        return
      }
      lastScale = scaleFactor
      containerRef.current.style.transform = `scale(${scaleFactor})`
      window.parent.postMessage(
        { type: 'resize', height: 1080 * scaleFactor },
        '*',
      )
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

  const content = renderSlide(
    slides,
    result.slide,
    <Ticker
      items={[{ message: 'Dit is een preview slide' }]}
      currentIndex={0}
    />,
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
