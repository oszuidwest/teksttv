import App from './App'
import { ImageSlide } from './components/rucphen/ImageSlide'
import { TextSlide } from './components/rucphen/TextSlide'
import { Ticker } from './components/rucphen/Ticker'
import { WeatherSlide } from './components/rucphen/WeatherSlide'

export default function RucphenApp(props: {
  apiBase: string
  channel?: string
}) {
  return (
    <App
      {...props}
      slides={{ text: TextSlide, image: ImageSlide, weather: WeatherSlide }}
      Ticker={Ticker}
    />
  )
}
