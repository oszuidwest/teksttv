import { useEffect, useState } from 'react'

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
  duration: number
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
      <div className="mt-[12px] mb-[92px] grow overflow-hidden bg-[#70747D] px-[116px] pl-[602px]">
        <div
          className="prose py-[14px] font-bold text-[49px] text-shadow text-white leading-[1.23em]"
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

const Ticker = ({ items }: { items: TickerItem[] }) => {
  const [currentItem, setCurrentItem] = useState(0)

  useEffect(() => {
    if (items.length === 0) return

    const timer = setInterval(() => {
      // @ts-ignore
      if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
          setCurrentItem((prevItem) => (prevItem + 1) % items.length)
        })
      } else {
        setCurrentItem((prevItem) => (prevItem + 1) % items.length)
      }
    }, items[currentItem].duration * 1000)

    return () => clearInterval(timer)
  }, [items, currentItem])

  if (items.length === 0) return null

  return (
    <div className="absolute right-0 bottom-[91px] left-0 z-30 flex items-center bg-black font-bold font-tahoma text-[#F7BF19] text-[51px] tracking-wide">
      <span className="grow pl-[121px]">{items[currentItem].message}</span>
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(
          'https://preview.zuidwestupdate.nl/wp-json/narrowcasting/v1/slides',
        )
        const data = await response.json()
        setSlides(data)
      } catch (error) {
        console.error('Error fetching slides:', error)
      }
    }

    const fetchTickerItems = async () => {
      try {
        const response = await fetch(
          'https://preview.zuidwestupdate.nl/wp-json/narrowcasting/v1/ticker',
        )
        const data = await response.json()
        setTickerItems(data)
      } catch (error) {
        console.error('Error fetching ticker items:', error)
      }
    }

    fetchSlides()
    fetchTickerItems()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      // @ts-ignore
      if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
          setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
        })
      } else {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
      }
    }, slides[currentSlide].duration)

    return () => clearInterval(timer)
  }, [slides, currentSlide])

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
      <Ticker items={tickerItems} />
    </div>
  )
}

export default App
