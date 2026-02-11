import { Frame } from './components/zuidwest/Frame'
import { ImageSlide } from './components/zuidwest/ImageSlide'
import { TextSlide } from './components/zuidwest/TextSlide'
import { Ticker } from './components/zuidwest/Ticker'
import Preview from './Preview'

export default function ZuidWestPreview(props: {
  apiBase: string
  channel: string
}) {
  const theme = props.channel === 'tv1' ? 'green' : 'blue'

  return (
    <Preview
      {...props}
      slides={{
        text: (p) => <TextSlide {...p} theme={theme} />,
        image: ImageSlide,
      }}
      Ticker={(p) => <Ticker {...p} theme={theme} />}
      Frame={(p) => <Frame {...p} theme={theme} />}
    />
  )
}
