import { Frame } from './components/bredanu/Frame'
import { ImageSlide } from './components/bredanu/ImageSlide'
import { TextSlide } from './components/bredanu/TextSlide'
import { Ticker } from './components/bredanu/Ticker'
import Preview from './Preview'

export default function BredaNuPreview(props: {
  apiBase: string
  channel?: string
}) {
  return (
    <Preview
      {...props}
      slides={{ text: TextSlide, image: ImageSlide }}
      Ticker={Ticker}
      Frame={Frame}
    />
  )
}
