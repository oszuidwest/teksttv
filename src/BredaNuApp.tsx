import App from './App'
import { Frame } from './components/bredanu/Frame'
import { ImageSlide } from './components/bredanu/ImageSlide'
import { TextSlide } from './components/bredanu/TextSlide'
import { Ticker } from './components/bredanu/Ticker'

export default function BredaNuApp(props: {
  apiBase: string
  channel?: string
}) {
  return (
    <App
      {...props}
      channel={props.channel ?? 'bredanu'}
      slides={{ text: TextSlide, image: ImageSlide }}
      Ticker={Ticker}
      Frame={Frame}
    />
  )
}
