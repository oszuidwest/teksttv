// Type-checked examples for the channel payload schema.
// Not imported anywhere — validated by tsc --noEmit only.

import type { z } from 'zod'
import type {
  ChannelPayloadSchema,
  CommercialSlideData,
  CommercialTransitionSlideData,
  ImageSlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

export const textSlide = {
  type: 'text',
  duration: 15000,
  title: 'News of the Day',
  body: 'This is a news article with <strong>HTML</strong> support.',
  image: 'https://example.com/sidebar.jpg',
} satisfies TextSlideData

export const imageSlide = {
  type: 'image',
  duration: 10000,
  url: 'https://example.com/image.jpg',
} satisfies ImageSlideData

export const weatherSlide = {
  type: 'weather',
  duration: 20000,
  title: 'Weather Forecast',
  location: 'Roosendaal',
  days: [
    {
      date: 'monday 12 jan',
      day_short: 'today',
      temp_min: 5,
      temp_max: 12,
      weather_id: 800,
      description: 'Sunny',
      icon: '01d',
      wind_direction: 'ZW',
      wind_beaufort: 3,
    },
  ],
} satisfies WeatherSlideData

export const commercialSlide = {
  type: 'commercial',
  duration: 8000,
  url: 'https://example.com/ad.jpg',
} satisfies CommercialSlideData

export const commercialTransitionSlide = {
  type: 'commercial_transition',
  duration: 2000,
  url: 'https://example.com/transition.jpg',
} satisfies CommercialTransitionSlideData

export const tickerItems = [
  { message: 'Now on air: Morning Show' },
  { message: 'Breaking: Local news update' },
] satisfies TickerItem[]

export const fullPayload = {
  slides: [textSlide, weatherSlide, imageSlide],
  ticker: tickerItems,
} satisfies z.infer<typeof ChannelPayloadSchema>
