import React, { useState, useEffect } from 'react'

const Slide = ({ content, currentTime, pageNumber, totalPages }) => (
  <div className="relative flex h-full w-full flex-col bg-gray-100">
    <div className="bg-gray-800 p-3 font-bold text-2xl text-white">
      {content.header}
    </div>
    <div className="absolute top-20 left-5 flex h-24 w-24 items-center justify-center rounded-lg bg-white p-2 text-center text-sm">
      {content.logo}
    </div>
    <div
      className="m-5 flex-grow rounded-lg bg-gray-200 bg-opacity-80 p-5 text-lg leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content.body }}
    />
    <div className="absolute right-24 bottom-16 text-lg">
      {`(${pageNumber}/${totalPages})`}
    </div>
    <div className="absolute right-5 bottom-16 font-bold text-2xl">
      {currentTime}
    </div>
    <div className="absolute right-0 bottom-0 left-0 bg-yellow-400 p-3 text-lg">
      {content.footer}
    </div>
  </div>
)

const slides = [
  {
    header: 'SCHILDERS- EN TEKENCLUB ST. JOSEPH - ST. WILLEBRORD',
    logo: 'Schildersclub St. Joseph',
    body: `
      <p>Iedereen kan (leren) schilderen. Sommige leden hadden nog geen kwast in hun handen gehad voor ze op de club kwamen, en maken nu prachtige schilderijen.</p>
      <p>Er wordt van alles geschilderd, van gezichten, mensen, dieren tot landschappen en stillevens.</p>
      <p>Lid worden van de club kost € 100,- per jaar. Hiervoor kun je op iedere dag of avond schilderen of tekenen, met gratis koffie en thee en veel gezelligheid.</p>
      <p>Op woensdagavond is de club dicht.</p>
    `,
    footer: 'Bij TV Krant adverteren = omzet genereren !!',
  },
  // Add more slides here...
]

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 10000) // Change slide every 10 seconds

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timeUpdater = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      )
    }, 1000)

    return () => clearInterval(timeUpdater)
  }, [])

  return (
    <div className="h-[1080px] w-[1920px]">
      <Slide
        content={slides[currentSlide]}
        currentTime={currentTime}
        pageNumber={currentSlide + 1}
        totalPages={slides.length}
      />
    </div>
  )
}

export default App
