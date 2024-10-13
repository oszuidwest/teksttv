import { useEffect, useState } from 'react'

interface Slide {
  type: 'image' | 'text'
  duration: number
  title: string
  body: string
  image: string
  url: string
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
        <h1 className="font-bold text-[51px] text-white uppercase tracking-wide drop-shadow-[3px_3px_1px_black]">
          {content.title}
        </h1>
      </div>
      <div className="mt-[12px] mb-[92px] grow overflow-hidden bg-[#70747D] px-[116px] pl-[602px]">
        <div
          className="prose py-[14px] font-bold text-[49px] text-white leading-[1.23em] drop-shadow-[3px_3px_1px_black]"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  </div>
)

const ImageSlide = ({ content }: { content: Slide }) => (
  <div className="relative h-full w-full">
    <img src={content.url} alt="" className="h-full w-full object-cover" />
  </div>
)

function App() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

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

    fetchSlides()
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
    <div className="h-[1080px] w-[1920px]">
      <CurrentSlideComponent
        key={currentSlide}
        content={slides[currentSlide]}
      />
    </div>
  )
}

export default App
