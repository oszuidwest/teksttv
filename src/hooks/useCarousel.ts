import { useCallback, useEffect, useState } from 'react'
import type { SlideData, TickerItem } from '../types'

export function useCarousel({
  apiBase,
  channel,
}: {
  apiBase: string
  channel?: string
}) {
  const [slides, setSlides] = useState<SlideData[]>([])
  const [nextSlides, setNextSlides] = useState<SlideData[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [nextTickerItems, setNextTickerItems] = useState<TickerItem[]>([])
  const [tickerIndex, setTickerIndex] = useState(0)
  const [imagesToPreload, setImagesToPreload] = useState<string[]>([])

  const fetchData = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        let newSlides: SlideData[]
        let newTickerItems: TickerItem[]

        if (channel) {
          const response = await fetch(`${apiBase}/teksttv?channel=${channel}`)
          const data = await response.json()
          newSlides = data.slides
          newTickerItems = data.ticker
        } else {
          const [slidesResponse, tickerResponse] = await Promise.all([
            fetch(`${apiBase}/teksttv-slides`),
            fetch(`${apiBase}/teksttv-ticker`),
          ])
          newSlides = await slidesResponse.json()
          newTickerItems = await tickerResponse.json()
        }

        const imageUrls = [
          ...new Set(
            newSlides
              .flatMap((slide: SlideData) => {
                switch (slide.type) {
                  case 'text':
                    return slide.image || undefined
                  case 'image':
                  case 'commercial':
                  case 'commercial_transition':
                    return slide.url
                  default:
                    return undefined
                }
              })
              .filter(Boolean),
          ),
        ] as string[]

        if (isInitialLoad) {
          setSlides(newSlides)
          setTickerItems(newTickerItems)
          setImagesToPreload(imageUrls)
        } else {
          setNextSlides(newSlides)
          setNextTickerItems(newTickerItems)
          setImagesToPreload((prevUrls) => [
            ...new Set([...prevUrls, ...imageUrls]),
          ])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    [apiBase, channel],
  )

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    const fetchInterval = setInterval(
      () => {
        fetchData(false)
      },
      slides.length > 0 ? 5 * 60 * 1000 : 60 * 1000,
    )

    return () => clearInterval(fetchInterval)
  }, [fetchData, slides.length])

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      const advance = () => {
        setCurrentSlide((prevSlide) => {
          const nextSlide = (prevSlide + 1) % slides.length
          if (nextSlide === 0 && nextSlides.length > 0) {
            setSlides(nextSlides)
            setNextSlides([])
            setImagesToPreload((prevUrls) => {
              const newImageUrls = nextSlides
                .flatMap((slide) => {
                  switch (slide.type) {
                    case 'text':
                      return slide.image || undefined
                    case 'image':
                    case 'commercial':
                    case 'commercial_transition':
                      return slide.url
                    default:
                      return undefined
                  }
                })
                .filter(Boolean)
              return prevUrls.filter((url) => newImageUrls.includes(url))
            })
            return 0
          }
          return nextSlide
        })

        setTickerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % tickerItems.length
          if (nextIndex === 0 && nextTickerItems.length > 0) {
            setTickerItems(nextTickerItems)
            setNextTickerItems([])
            return 0
          }
          return nextIndex
        })
      }

      if (document.startViewTransition) {
        document.startViewTransition(advance)
      } else {
        advance()
      }
    }, slides[currentSlide].duration)

    return () => clearInterval(timer)
  }, [slides, currentSlide, nextSlides, tickerItems, nextTickerItems])

  return {
    slides,
    currentSlide,
    tickerItems,
    tickerIndex,
    imagesToPreload,
  }
}
