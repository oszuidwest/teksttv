import { useEffect, useState } from 'react'

interface Slide {
  title: string
  body: string
  image: string
}

const Slide = ({ content }: { content: Slide }) => (
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

const slides: Slide[] = [
  {
    title: 'Nieuw seizoen Warme Trapkes gestart',
    body: `
      <p>De bezoekers vertelden de Warme Trapkes vooral in de winter zeer op prijs te stellen. "Bij slecht weer kom je anders niet buiten. Het is leuk om elkaar eens per maand te ontmoeten, gezellig samen te eten en bij te praten; hier worden onderling afspraken gemaakt om eens ergens naartoe te gaan of samen iets te ondernemen". Na het eten werd door enkele groepjes gekaart of een ander spelletje gedaan.</p>
      <p>(2/3)</p>
    `,
    image:
      'https://preview.zuidwestupdate.nl/wp-content/uploads/2024/10/sidebar-halderberge.png',
  },
  // Add more slides here...
]

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 10000) // Change slide every 10 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-[1080px] w-[1920px]">
      <Slide content={slides[currentSlide]} />
    </div>
  )
}

export default App
