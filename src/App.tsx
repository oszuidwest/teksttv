import { useCallback, useEffect, useState } from 'react'
import { ImageSlideComponent } from './components/ImageSlideComponent'
import { TextSlideComponent } from './components/TextSlideComponent'
import { Ticker } from './components/Ticker'
import type {
  ImageSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
} from './types'

function App() {
  const [slides, setSlides] = useState<SlideData[]>([])
  const [nextSlides, setNextSlides] = useState<SlideData[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [nextTickerItems, setNextTickerItems] = useState<TickerItem[]>([])
  const [tickerIndex, setTickerIndex] = useState(0)
  const [imagesToPreload, setImagesToPreload] = useState<string[]>([])

  const fetchData = useCallback(async (isInitialLoad: boolean) => {
    try {
      const [slidesResponse, tickerResponse] = await Promise.all([
        fetch('https://cms.tv-krant.nl/wp-json/zw/v1/teksttv-slides'),
        fetch('https://cms.tv-krant.nl/wp-json/zw/v1/teksttv-ticker'),
      ])
      const newSlides = await slidesResponse.json()
      const newTickerItems = await tickerResponse.json()

      const imageUrls = [
        ...new Set(
          newSlides
            .flatMap((slide: SlideData) => {
              if (slide.type === 'text') {
                return slide.image
              }
              if (slide.type === 'image') {
                return slide.url
              }
              return undefined
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
  }, [])

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
      // @ts-ignore
      if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
          setCurrentSlide((prevSlide) => {
            const nextSlide = (prevSlide + 1) % slides.length
            if (nextSlide === 0 && nextSlides.length > 0) {
              setSlides(nextSlides)
              setNextSlides([])
              setImagesToPreload((prevUrls) => {
                // Remove images that are no longer in the new slides
                const newImageUrls = nextSlides
                  .flatMap((slide) => {
                    if (slide.type === 'text') {
                      return slide.image
                    }
                    if (slide.type === 'image') {
                      return slide.url
                    }
                    return []
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
        })
      } else {
        // Fallback for browsers that don't support startViewTransition
        setCurrentSlide((prevSlide) => {
          const nextSlide = (prevSlide + 1) % slides.length
          if (nextSlide === 0 && nextSlides.length > 0) {
            setSlides(nextSlides)
            setNextSlides([])
            setImagesToPreload((prevUrls) => {
              // Remove images that are no longer in the new slides
              const newImageUrls = nextSlides
                .flatMap((slide) => {
                  if (slide.type === 'text') {
                    return slide.image
                  }
                  if (slide.type === 'image') {
                    return slide.url
                  }
                  return []
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
    }, slides[currentSlide].duration)

    return () => clearInterval(timer)
  }, [slides, currentSlide, nextSlides, tickerItems, nextTickerItems])

  if (slides.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative h-[1080px] w-[1920px]">
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      {slides[currentSlide].type === 'image' ? (
        <ImageSlideComponent
          key={currentSlide}
          content={slides[currentSlide] as ImageSlideData}
        />
      ) : (
        <TextSlideComponent
          key={currentSlide}
          content={slides[currentSlide] as TextSlideData}
        />
      )}
      <Ticker items={tickerItems} currentIndex={tickerIndex} />
    </div>
  )
}

export default App
