import { ImageSlide } from './components/rucphen/ImageSlide'
import { TextSlide } from './components/rucphen/TextSlide'
import { Ticker } from './components/rucphen/Ticker'
import Preview from './Preview'

export default function RucphenPreview(props: { apiBase: string }) {
  return (
    <Preview
      {...props}
      slides={{ text: TextSlide, image: ImageSlide }}
      Ticker={Ticker}
    />
  )
}
