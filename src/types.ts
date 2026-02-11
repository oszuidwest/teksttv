import { z } from 'zod'

export const ImageSlideDataSchema = z.object({
  type: z.literal('image'),
  duration: z.number(),
  url: z.string().url(),
})

export const TextSlideDataSchema = z.object({
  type: z.literal('text'),
  duration: z.number(),
  title: z.string(),
  body: z.string(),
  image: z.string(),
})

export const WeatherDaySchema = z.object({
  date: z.string(),
  day_short: z.string(),
  temp_min: z.number(),
  temp_max: z.number(),
  weather_id: z.number(),
  description: z.string(),
  icon: z.string(),
  wind_direction: z.string(),
  wind_beaufort: z.number(),
})

export const WeatherSlideDataSchema = z.object({
  type: z.literal('weather'),
  duration: z.number(),
  title: z.string(),
  location: z.string(),
  days: z.array(WeatherDaySchema),
})

export const CommercialSlideDataSchema = z.object({
  type: z.literal('commercial'),
  duration: z.number(),
  url: z.string().url(),
})

export const CommercialTransitionSlideDataSchema = z.object({
  type: z.literal('commercial_transition'),
  duration: z.number(),
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
  message: z.string(),
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
