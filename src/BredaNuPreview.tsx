import { Frame } from './components/bredanu/Frame'
import { IframeSlide } from './components/bredanu/IframeSlide'
import { ImageSlide } from './components/bredanu/ImageSlide'
import { TextSlide } from './components/bredanu/TextSlide'
import { Ticker } from './components/bredanu/Ticker'
import { WeatherSlide } from './components/bredanu/WeatherSlide'
import Preview from './Preview'

export default function BredaNuPreview(props: {
  apiBase: string
  channel?: string
}) {
  return (
    <Preview
      {...props}
      slides={{
        text: TextSlide,
        image: ImageSlide,
        weather: WeatherSlide,
        iframe: IframeSlide,
      }}
      Ticker={Ticker}
      Frame={Frame}
    />
  )
}
