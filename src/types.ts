import { z } from 'zod'

const BaseSlideSchema = z.object({
  duration: z.number().positive().describe('Display duration in milliseconds'),
})

export const ImageSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('image'),
  url: z.string().url(),
})

export const TextSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('text'),
  title: z.string().describe('Slide title (HTML supported)'),
  body: z.string().describe('Main content (HTML supported)'),
  image: z.string().describe('Optional sidebar image URL'),
})

export const WeatherDaySchema = z.object({
  date: z.string().describe('Date in YYYY-MM-DD format'),
  day_short: z.string().describe('Short day name (ma, di, etc.)'),
  temp_min: z.number().describe('Minimum temperature in °C'),
  temp_max: z.number().describe('Maximum temperature in °C'),
  weather_id: z.number().describe('OpenWeatherMap weather condition ID'),
  description: z.string().describe('Weather description'),
  icon: z.string().describe('OpenWeatherMap icon code'),
  wind_direction: z
    .enum([
      'N',
      'NNO',
      'NO',
      'ONO',
      'O',
      'OZO',
      'ZO',
      'ZZO',
      'Z',
      'ZZW',
      'ZW',
      'WZW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ])
    .describe('Wind direction (Dutch compass abbreviations)'),
  wind_beaufort: z
    .number()
    .int()
    .min(0)
    .max(12)
    .describe('Wind force on the Beaufort scale'),
})

export const WeatherSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('weather'),
  title: z.string(),
  location: z.string(),
  days: z.array(WeatherDaySchema),
})

export const CommercialSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('commercial'),
  url: z.string().url(),
})

export const CommercialTransitionSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('commercial_transition'),
  url: z.string().url(),
})

export const SlideDataSchema = z.discriminatedUnion('type', [
  ImageSlideDataSchema,
  TextSlideDataSchema,
  WeatherSlideDataSchema,
  CommercialSlideDataSchema,
  CommercialTransitionSlideDataSchema,
])

export const TickerItemSchema = z.object({
  message: z
    .string()
    .describe(
      'Ticker message (HTML supported). Text before a colon in the first 30 characters is displayed as a bold label.',
    ),
})

export const SlideDataListSchema = z.array(SlideDataSchema)
export const TickerItemsSchema = z.array(TickerItemSchema)
export const ChannelPayloadSchema = z.object({
  slides: SlideDataListSchema,
  ticker: TickerItemsSchema,
})

// Type inference
export type ImageSlideData = z.infer<typeof ImageSlideDataSchema>
export type TextSlideData = z.infer<typeof TextSlideDataSchema>
export type WeatherDay = z.infer<typeof WeatherDaySchema>
export type WeatherSlideData = z.infer<typeof WeatherSlideDataSchema>
export type CommercialSlideData = z.infer<typeof CommercialSlideDataSchema>
export type CommercialTransitionSlideData = z.infer<
  typeof CommercialTransitionSlideDataSchema
>
export type SlideData = z.infer<typeof SlideDataSchema>
export type TickerItem = z.infer<typeof TickerItemSchema>

// Component prop unions — image/commercial/commercial_transition all render as full-screen images
export type FullScreenSlideData =
  | ImageSlideData
  | CommercialSlideData
  | CommercialTransitionSlideData
