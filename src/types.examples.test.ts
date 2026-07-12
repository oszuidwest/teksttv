// Example payloads use `satisfies` and Zod parsing so documented JSON stays
// aligned with ChannelPayloadSchema.

import { describe, expect, test } from 'bun:test'
import type { z } from 'zod'
import {
  ChannelPayloadSchema,
  type CommercialSlideData,
  CommercialSlideDataSchema,
  type CommercialTransitionSlideData,
  CommercialTransitionSlideDataSchema,
  type IframeSlideData,
  IframeSlideDataSchema,
  type ImageSlideData,
  ImageSlideDataSchema,
  SlideDataSchema,
  type TextSlideData,
  TextSlideDataSchema,
  type TickerItem,
  TickerItemSchema,
  type WeatherSlideData,
  WeatherSlideDataSchema,
} from './types'

const textSlide = {
  type: 'text',
  duration: 15000,
  title: 'News of the Day',
  body: 'This is a news article with <strong>HTML</strong> support.',
  image: { url: 'https://example.com/sidebar.jpg' },
} satisfies TextSlideData

const textSlideWithImageData = {
  type: 'text',
  duration: 15000,
  title: 'News with Attribution',
  body: 'This article has an image with caption and attribution.',
  image: {
    url: 'https://example.com/sidebar.jpg',
    caption: 'A beautiful sunset',
    attribution: 'Photo by Jane Doe',
  },
} satisfies TextSlideData

const imageSlide = {
  type: 'image',
  duration: 10000,
  url: 'https://example.com/image.jpg',
} satisfies ImageSlideData

const imageSlideWithMeta = {
  type: 'image',
  duration: 10000,
  url: 'https://example.com/image.jpg',
  caption: 'Town hall during sunset',
  attribution: 'Photo by John Smith',
} satisfies ImageSlideData

// Mirrors CMS output: dates such as `zaterdag 9 mei`, `vandaag` for today,
// then `ma`, `di`, and so on.
const weatherSlide = {
  type: 'weather',
  duration: 20000,
  title: 'Weerbericht',
  location: 'Roosendaal',
  days: [
    {
      date: 'zaterdag 9 mei',
      day_short: 'vandaag',
      temp_min: 8,
      temp_max: 20,
      weather_id: 800,
      description: 'Helder',
      icon: '01d',
      wind_direction: 'NNO',
      wind_beaufort: 3,
    },
    {
      date: 'zondag 10 mei',
      day_short: 'zo',
      temp_min: 9,
      temp_max: 17,
      weather_id: 803,
      description: 'Bewolkt',
      icon: '04d',
      wind_direction: 'NNO',
      wind_beaufort: 4,
    },
  ],
} satisfies WeatherSlideData

const commercialSlide = {
  type: 'commercial',
  duration: 8000,
  url: 'https://example.com/ad.jpg',
} satisfies CommercialSlideData

const commercialTransitionSlide = {
  type: 'commercial_transition',
  duration: 2000,
  url: 'https://example.com/transition.jpg',
} satisfies CommercialTransitionSlideData

const iframeSlide = {
  type: 'iframe',
  duration: 30000,
  url: 'https://example.com/dashboard',
} satisfies IframeSlideData

const tickerItems = [
  { message: 'Now on air: Morning Show' },
  { message: 'Breaking: Local news update' },
] satisfies TickerItem[]

const fullPayload = {
  slides: [textSlide, weatherSlide, imageSlide, iframeSlide],
  ticker: tickerItems,
} satisfies z.infer<typeof ChannelPayloadSchema>

describe('schema examples accept documented payloads', () => {
  test('TextSlideDataSchema parses minimal text slide', () => {
    expect(() => TextSlideDataSchema.parse(textSlide)).not.toThrow()
  })

  test('TextSlideDataSchema parses text slide with image caption/attribution', () => {
    expect(() =>
      TextSlideDataSchema.parse(textSlideWithImageData),
    ).not.toThrow()
  })

  test('ImageSlideDataSchema parses minimal image slide', () => {
    expect(() => ImageSlideDataSchema.parse(imageSlide)).not.toThrow()
  })

  test('ImageSlideDataSchema parses image slide with caption/attribution', () => {
    expect(() => ImageSlideDataSchema.parse(imageSlideWithMeta)).not.toThrow()
  })

  test('WeatherSlideDataSchema parses weather slide', () => {
    expect(() => WeatherSlideDataSchema.parse(weatherSlide)).not.toThrow()
  })

  test('CommercialSlideDataSchema parses commercial slide', () => {
    expect(() => CommercialSlideDataSchema.parse(commercialSlide)).not.toThrow()
  })

  test('CommercialTransitionSlideDataSchema parses commercial transition slide', () => {
    expect(() =>
      CommercialTransitionSlideDataSchema.parse(commercialTransitionSlide),
    ).not.toThrow()
  })

  test('IframeSlideDataSchema parses iframe slide', () => {
    expect(() => IframeSlideDataSchema.parse(iframeSlide)).not.toThrow()
  })

  test('SlideDataSchema parses iframe slide through the union', () => {
    expect(() => SlideDataSchema.parse(iframeSlide)).not.toThrow()
  })

  test.each(tickerItems)('TickerItemSchema parses ticker item #%#', (item) => {
    expect(() => TickerItemSchema.parse(item)).not.toThrow()
  })

  test('ChannelPayloadSchema parses full channel payload', () => {
    expect(() => ChannelPayloadSchema.parse(fullPayload)).not.toThrow()
  })
})
