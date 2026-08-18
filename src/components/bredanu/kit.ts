import type { SlideKit } from '../../SlideRenderer'
import { Frame } from './Frame'
import { IframeSlide } from './IframeSlide'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { WeatherSlide } from './WeatherSlide'

/** BredaNu has one kit: no theme variants. */
export const bredanuKit: SlideKit = {
  slides: {
    text: TextSlide,
    image: ImageSlide,
    weather: WeatherSlide,
    iframe: IframeSlide,
  },
  Ticker,
  Frame,
}
