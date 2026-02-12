import { useCallback, useEffect, useState } from 'react'
import type { SlideData, TickerItem } from '../types'
import { SlideDataSchema, TickerItemSchema } from '../types'

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

  const getValidSlides = useCallback((value: unknown, source: string) => {
    if (!Array.isArray(value)) {
      console.error(`Invalid slides payload from ${source}: expected array`)
      return []
    }

    return value.flatMap((entry, index) => {
      const parsed = SlideDataSchema.safeParse(entry)
      if (!parsed.success) {
        console.error(
          `Skipping invalid slide ${index} from ${source}`,
          parsed.error.issues,
        )
        return []
      }
      return [parsed.data]
    })
  }, [])

  const getValidTickerItems = useCallback((value: unknown, source: string) => {
    if (!Array.isArray(value)) {
      console.error(`Invalid ticker payload from ${source}: expected array`)
      return []
    }

    return value.flatMap((entry, index) => {
      const parsed = TickerItemSchema.safeParse(entry)
      if (!parsed.success) {
        console.error(
          `Skipping invalid ticker item ${index} from ${source}`,
          parsed.error.issues,
        )
        return []
      }
      return [parsed.data]
    })
  }, [])

  const fetchData = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        let slidesData: unknown
        let tickerData: unknown

        if (channel) {
          const response = await fetch(`${apiBase}/teksttv?channel=${channel}`)
          if (!response.ok) {
            throw new Error(
              `Unable to fetch channel feed (status ${response.status})`,
            )
          }
          const data = (await response.json()) as {
            slides?: unknown
            ticker?: unknown
          }
          slidesData = data.slides
          tickerData = data.ticker
        } else {
          const [slidesResponse, tickerResponse] = await Promise.all([
            fetch(`${apiBase}/teksttv-slides`),
            fetch(`${apiBase}/teksttv-ticker`),
          ])
          if (!slidesResponse.ok || !tickerResponse.ok) {
            throw new Error(
              `Unable to fetch feed (slides ${slidesResponse.status}, ticker ${tickerResponse.status})`,
            )
          }
          const [rawSlidesData, rawTickerData] = await Promise.all([
            slidesResponse.json(),
            tickerResponse.json(),
          ])
          slidesData = rawSlidesData
          tickerData = rawTickerData
        }

        const newSlides = getValidSlides(
          slidesData,
          channel ? `channel ${channel}` : 'slides endpoint',
        )
        const newTickerItems = getValidTickerItems(
          tickerData,
          channel ? `channel ${channel}` : 'ticker endpoint',
        )

        if (newSlides.length === 0) {
          throw new Error('Feed returned no valid slides')
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
    [apiBase, channel, getValidSlides, getValidTickerItems],
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
    const currentDuration =
      slides[currentSlide]?.duration ?? slides[0]?.duration
    if (!currentDuration) return

    const timer = setInterval(() => {
      const advance = () => {
        setCurrentSlide((prevSlide) => {
          if (slides.length === 0) return 0
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
          if (tickerItems.length === 0) {
            if (nextTickerItems.length > 0) {
              setTickerItems(nextTickerItems)
              setNextTickerItems([])
            }
            return 0
          }
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
    }, currentDuration)

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
