import { z } from 'zod'

const BaseSlideSchema = z.object({
  duration: z.number().positive().describe('Display duration in milliseconds'),
})

export const ImageDataSchema = z.object({
  url: z.url().describe('Image URL'),
  caption: z.string().optional().describe('Image caption'),
  attribution: z.string().optional().describe('Image attribution or credit'),
})

function normalizeOptionalImageData(value: unknown) {
  // Upstream CMS emits null when a text slide has no sidebar image.
  if (value === null) {
    return undefined
  }

  return value
}

const OptionalImageDataSchema = z.preprocess(
  normalizeOptionalImageData,
  ImageDataSchema.optional(),
)

export const ImageSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('image'),
  ...ImageDataSchema.shape,
})

export const TextSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('text'),
  title: z.string().describe('Slide title (HTML supported)'),
  body: z.string().describe('Main content (HTML supported)'),
  image: OptionalImageDataSchema.describe('Optional sidebar image'),
})

export const WeatherDaySchema = z.object({
  date: z.string().describe('Human-readable date, e.g. "donderdag 12 feb"'),
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
  url: z.url(),
})

export const CommercialTransitionSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('commercial_transition'),
  url: z.url(),
})

export const IframeSlideDataSchema = BaseSlideSchema.extend({
  type: z.literal('iframe'),
  url: z
    .url({ protocol: /^https?$/ })
    .describe('HTTP(S) URL of an embeddable page (must allow framing)'),
})

export const SlideDataSchema = z.discriminatedUnion('type', [
  ImageSlideDataSchema,
  TextSlideDataSchema,
  WeatherSlideDataSchema,
  CommercialSlideDataSchema,
  CommercialTransitionSlideDataSchema,
  IframeSlideDataSchema,
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

export type ImageData = z.infer<typeof ImageDataSchema>
export type ImageSlideData = z.infer<typeof ImageSlideDataSchema>
export type TextSlideData = z.infer<typeof TextSlideDataSchema>
export type WeatherDay = z.infer<typeof WeatherDaySchema>
export type WeatherSlideData = z.infer<typeof WeatherSlideDataSchema>
export type CommercialSlideData = z.infer<typeof CommercialSlideDataSchema>
export type CommercialTransitionSlideData = z.infer<
  typeof CommercialTransitionSlideDataSchema
>
export type IframeSlideData = z.infer<typeof IframeSlideDataSchema>
export type SlideData = z.infer<typeof SlideDataSchema>
export type TickerItem = z.infer<typeof TickerItemSchema>

/** Full-screen renderer accepts every image-like slide type. */
export type FullScreenSlideData =
  | ImageSlideData
  | CommercialSlideData
  | CommercialTransitionSlideData
