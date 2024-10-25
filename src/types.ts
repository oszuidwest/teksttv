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
  image: z.string().url(),
})

export const SlideDataSchema = z.discriminatedUnion('type', [
  ImageSlideDataSchema,
  TextSlideDataSchema,
])

export const TickerItemSchema = z.object({
  message: z.string(),
})

// Type inference
export type ImageSlideData = z.infer<typeof ImageSlideDataSchema>
export type TextSlideData = z.infer<typeof TextSlideDataSchema>
export type SlideData = z.infer<typeof SlideDataSchema>
export type TickerItem = z.infer<typeof TickerItemSchema>
