import type { SlideKit } from '../../SlideRenderer'
import { Frame } from './Frame'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import type { ThemeName } from './theme'
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

// Built once at module scope so component identities stay stable across
// renders; both the live app and the preview consume the same kit.
export const kits: Record<ThemeName, SlideKit> = {
  green: makeKit('green'),
  blue: makeKit('blue'),
}
