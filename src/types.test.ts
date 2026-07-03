import { describe, expect, test } from 'bun:test'
import { ImageSlideDataSchema, TextSlideDataSchema } from './types'

const baseTextSlide = {
  type: 'text',
  duration: 1000,
  title: 'Title',
  body: 'Body',
} as const

const baseImageSlide = {
  type: 'image',
  duration: 1000,
} as const

describe('TextSlideDataSchema image normalization', () => {
  test('accepts a missing image', () => {
    const parsed = TextSlideDataSchema.parse(baseTextSlide)

    expect(parsed).not.toHaveProperty('image')
  })

  test('normalizes null image to undefined', () => {
    const parsed = TextSlideDataSchema.parse({
      ...baseTextSlide,
      image: null,
    })

    expect(parsed.image).toBeUndefined()
  })

  test('rejects an image object with an invalid URL', () => {
    expect(() =>
      TextSlideDataSchema.parse({
        ...baseTextSlide,
        image: { url: 'not-a-url' },
      }),
    ).toThrow()
  })

  test('rejects image metadata without a URL', () => {
    expect(() =>
      TextSlideDataSchema.parse({
        ...baseTextSlide,
        image: { caption: 'Caption without image' },
      }),
    ).toThrow()
  })
})

// Happy-path acceptance is covered by types.examples.test.ts; this file keeps
// the normalization and rejection cases.
describe('ImageSlideDataSchema', () => {
  test('rejects a full-screen image slide without a URL', () => {
    expect(() => ImageSlideDataSchema.parse(baseImageSlide)).toThrow()
  })

  test('rejects a full-screen image slide with an invalid URL', () => {
    expect(() =>
      ImageSlideDataSchema.parse({
        ...baseImageSlide,
        url: 'not-a-url',
      }),
    ).toThrow()
  })
})
