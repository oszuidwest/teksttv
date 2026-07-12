import type { SlideKit } from '../../SlideRenderer'
import { Frame } from './Frame'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { WeatherSlide } from './WeatherSlide'

function makeKit(theme: 'green' | 'blue'): SlideKit {
  return {
    slides: {
      text: (p) => <TextSlide {...p} theme={theme} />,
      image: ImageSlide,
      weather: (p) => <WeatherSlide {...p} theme={theme} />,
    },
    Ticker: (p) => <Ticker {...p} theme={theme} />,
    Frame: (p) => <Frame {...p} theme={theme} />,
  }
}

// Built once at module scope so component identities stay stable across
// renders; both the live app and the preview consume the same kit.
const greenKit = makeKit('green')
const blueKit = makeKit('blue')

export function kitForChannel(channel: string): SlideKit {
  return channel === 'tv1' ? greenKit : blueKit
}
