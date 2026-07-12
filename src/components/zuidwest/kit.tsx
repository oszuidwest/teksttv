import type { SlideKit } from '../../SlideRenderer'
import { Frame } from './Frame'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { type ThemeName, themeForChannel } from './theme'
import { WeatherSlide } from './WeatherSlide'

function makeKit(theme: ThemeName): SlideKit {
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

// Module-scope kits keep component identities stable for app and preview.
const kits: Record<ThemeName, SlideKit> = {
  green: makeKit('green'),
  blue: makeKit('blue'),
}

export function kitForChannel(channel: string): SlideKit {
  return kits[themeForChannel(channel)]
}
