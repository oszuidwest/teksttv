import App from './App'
import { ImageSlide } from './components/rucphen/ImageSlide'
import { TextSlide } from './components/rucphen/TextSlide'
import { Ticker } from './components/rucphen/Ticker'

export default function RucphenApp(props: {
  apiBase: string
  channel?: string
}) {
  return (
    <App
      {...props}
      slides={{ text: TextSlide, image: ImageSlide }}
      Ticker={Ticker}
    />
  )
}
