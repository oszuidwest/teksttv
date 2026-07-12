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

// Module-level kits keep wrapper component identities stable for live and
// preview renders.
const greenKit = makeKit('green')
const blueKit = makeKit('blue')

/** Maps `tv1` to the green kit; every other channel uses the blue kit. */
export function kitForChannel(channel: string): SlideKit {
  return channel === 'tv1' ? greenKit : blueKit
}
