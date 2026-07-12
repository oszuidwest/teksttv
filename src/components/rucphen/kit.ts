import type { SlideKit } from '../../SlideRenderer'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { WeatherSlide } from './WeatherSlide'

/** Rucphen has no theme variants or frame, so live and preview share one kit. */
export const rucphenKit: SlideKit = {
  slides: { text: TextSlide, image: ImageSlide, weather: WeatherSlide },
  Ticker,
}
