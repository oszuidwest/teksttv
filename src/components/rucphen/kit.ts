import type { SlideComponents, TickerComponent } from '../../SlideRenderer'
import { ImageSlide } from './ImageSlide'
import { TextSlide } from './TextSlide'
import { Ticker } from './Ticker'
import { WeatherSlide } from './WeatherSlide'

// Rucphen has no theme variants and no frame; one kit shared by the live app
// and the preview.
export const rucphenKit: { slides: SlideComponents; Ticker: TickerComponent } =
  {
    slides: { text: TextSlide, image: ImageSlide, weather: WeatherSlide },
    Ticker,
  }
