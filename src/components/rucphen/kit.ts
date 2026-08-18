import type { SlideKit } from '../../SlideRenderer'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { WeatherSlide } from './WeatherSlide'

/** Rucphen has one kit: no theme variants and no frame. */
export const rucphenKit: SlideKit = {
  slides: { text: TextSlide, image: ImageSlide, weather: WeatherSlide },
  Ticker,
}
