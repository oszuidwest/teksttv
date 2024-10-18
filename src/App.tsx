import { useCallback, useEffect, useState } from 'react'

interface Slide {
  type: 'image' | 'text'
  duration: number
  title: string
  body: string
  image: string
  url: string
}

interface TickerItem {
  message: string
}

const TextSlide = ({ content }: { content: Slide }) => (
  <div className="relative h-full w-full bg-[#BBBBBB] font-tahoma">
    <div className="sidebar absolute inset-0 inset-y-0 left-0 z-10 w-[604px] bg-[#F7BF19]">
      <img src={content.image} alt="" className="inset-0 h-full object-cover" />
    </div>
    <svg
      className="absolute inset-0 z-5 h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="slantedGradient"
          x1="31%"
          y1="0%"
          x2="35%"
          y2="0.276%"
        >
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#slantedGradient)" />
    </svg>

    <div className="absolute absolute inset-0 flex flex-col">
      <div className="z-20 mt-[92px] w-full bg-[#626671] px-[116px] py-[14px]">
        <h1 className="font-bold text-[51px] text-shadow text-white uppercase tracking-wide">
          {content.title}
        </h1>
      </div>
      <div className="relative mt-[12px] mb-[92px] grow overflow-hidden bg-[#70747D] px-[116px] pl-[602px]">
        <svg
          viewBox="0 0 446 403"
          className="absolute right-0 bottom-0 h-auto w-[650px] fill-[#ffff00] opacity-20"
        >
          <path
            d="M351.55,1.39 C365.17,-1.27 379.51,-0.98 392.79,3.25 C408.66,8.08 423.7,16.74 434.53,29.48 C437.77,33.35 441.57,36.69 445,40.38 L445,60.73 C439.34,53.13 435.15,44.38 428.29,37.71 C423.74,33.25 419.43,28.47 414.17,24.81 C398.88,13.42 379.2,8.22 360.26,10.3 C350.46,11.64 340.78,13.78 331.2,16.19 C306.79,21.61 283.03,29.45 259.36,37.41 C225.69,49.81 192.55,63.83 160.98,80.95 C118.43,103.84 77.95,130.78 41.32,162.32 C33.75,168.75 26.8,175.93 20.99,183.99 C12.56,196.72 7.89,212.68 11.12,227.86 C13.22,241.91 20.75,254.47 29.95,265.04 C35.09,271.63 42.01,276.39 48.53,281.47 C77.01,303.68 106.65,324.33 136.8,344.21 C159.77,358.83 182.82,373.39 206.91,386.13 C216.58,391.93 227.28,395.84 236.74,402 L212.46,402 C209.34,399.98 206.41,397.67 203.18,395.83 C186.58,386.54 169.91,377.36 153.8,367.21 C149.06,364.25 144.41,361.09 139.34,358.71 C132.95,355.75 127.75,350.89 121.78,347.23 C103.64,335.55 86.39,322.56 68.62,310.34 C54,297.21 36.59,287.34 23.27,272.74 C10.94,259.26 2.27,242.12 0.05,223.9 C-1.66,207.86 4.01,191.94 12.58,178.6 C20.18,167.1 30.45,157.74 41,149.01 C49.85,141.81 58.76,134.69 67.97,127.96 C90.92,110.32 115.46,94.89 140.53,80.49 C206.31,43.66 277.49,15.98 351.55,1.39 L351.55,1.39 Z"
            id="Shape"
          />
        </svg>
        <div
          className="prose relative py-[14px] font-bold text-[49px] text-shadow text-white leading-[1.23em]"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  </div>
)

const ImageSlide = ({ content }: { content: Slide }) => (
  <div className="relative z-40 h-full w-full bg-black">
    <img src={content.url} alt="" className="h-full w-full object-cover" />
  </div>
)

const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return <span>{formatTime(time)}</span>
}

const Ticker = ({
  items,
  currentIndex,
}: { items: TickerItem[]; currentIndex: number }) => {
  if (items.length === 0) return null

  return (
    <div className="absolute right-0 bottom-[91px] left-0 z-30 flex items-center bg-black font-bold font-tahoma text-[#F7BF19] text-[51px] tracking-wide">
      <span className="grow pl-[121px]">{items[currentIndex].message}</span>
      <div className="relative w-[10px] self-stretch">
        <svg
          className="h-full w-full fill-white"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon points="0,100 100,0 100,100" />
        </svg>
      </div>
      <span className="bg-white pr-[110px] pl-[30px] text-[56px] text-black">
        <Clock />
      </span>
    </div>
  )
}

function App() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [nextSlides, setNextSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [nextTickerItems, setNextTickerItems] = useState<TickerItem[]>([])
  const [tickerIndex, setTickerIndex] = useState(0)

  const fetchData = useCallback(async (isInitialLoad: boolean) => {
    try {
      const [slidesResponse, tickerResponse] = await Promise.all([
        fetch('https://preview.zuidwestupdate.nl/wp-json/zw/v1/teksttv-slides'),
        fetch('https://preview.zuidwestupdate.nl/wp-json/zw/v1/teksttv-ticker'),
      ])
      const newSlides = await slidesResponse.json()
      const newTickerItems = await tickerResponse.json()

      if (isInitialLoad) {
        setSlides(newSlides)
        setTickerItems(newTickerItems)
      } else {
        setNextSlides(newSlides)
        setNextTickerItems(newTickerItems)
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
              return 0
            }
            return nextSlide
          })
        })
      } else {
        setCurrentSlide((prevSlide) => {
          const nextSlide = (prevSlide + 1) % slides.length
          if (nextSlide === 0 && nextSlides.length > 0) {
            setSlides(nextSlides)
            setNextSlides([])
            return 0
          }
          return nextSlide
        })
      }

      setTickerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % tickerItems.length
        if (nextIndex === 0 && nextTickerItems.length > 0) {
          setTickerItems(nextTickerItems)
          setNextTickerItems([])
          return 0
        }
        return nextIndex
      })
    }, slides[currentSlide].duration)

    return () => clearInterval(timer)
  }, [slides, currentSlide, nextSlides, tickerItems, nextTickerItems])

  if (slides.length === 0) {
    return <div>Loading...</div>
  }

  const CurrentSlideComponent =
    slides[currentSlide].type === 'image' ? ImageSlide : TextSlide

  return (
    <div className="relative h-[1080px] w-[1920px]">
      <CurrentSlideComponent
        key={currentSlide}
        content={slides[currentSlide]}
      />
      <Ticker items={tickerItems} currentIndex={tickerIndex} />
    </div>
  )
}

export default App
