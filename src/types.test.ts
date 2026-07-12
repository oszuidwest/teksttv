import { describe, expect, test } from 'bun:test'
import {
  IframeSlideDataSchema,
  ImageSlideDataSchema,
  TextSlideDataSchema,
} from './types'

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

  test('accepts an image object with a URL', () => {
    const parsed = TextSlideDataSchema.parse({
      ...baseTextSlide,
      image: { url: 'https://example.com/sidebar.jpg' },
    })

    expect(parsed.image).toEqual({
      url: 'https://example.com/sidebar.jpg',
    })
  })

  test('keeps caption and attribution on valid image data', () => {
    const parsed = TextSlideDataSchema.parse({
      ...baseTextSlide,
      image: {
        url: 'https://example.com/sidebar.jpg',
        caption: 'Caption',
        attribution: 'Credit',
      },
    })

    expect(parsed.image).toEqual({
      url: 'https://example.com/sidebar.jpg',
      caption: 'Caption',
      attribution: 'Credit',
    })
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

describe('ImageSlideDataSchema', () => {
  test('accepts a full-screen image slide with a URL', () => {
    const parsed = ImageSlideDataSchema.parse({
      ...baseImageSlide,
      url: 'https://example.com/image.jpg',
    })

    expect(parsed).toEqual({
      ...baseImageSlide,
      url: 'https://example.com/image.jpg',
    })
  })

  test('keeps caption and attribution on full-screen image slides', () => {
    const parsed = ImageSlideDataSchema.parse({
      ...baseImageSlide,
      url: 'https://example.com/image.jpg',
      caption: 'Caption',
      attribution: 'Credit',
    })

    expect(parsed).toEqual({
      ...baseImageSlide,
      url: 'https://example.com/image.jpg',
      caption: 'Caption',
      attribution: 'Credit',
    })
  })

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

describe('IframeSlideDataSchema', () => {
  const baseIframeSlide = {
    type: 'iframe',
    duration: 1000,
  } as const

  test('accepts an iframe slide with a URL', () => {
    const parsed = IframeSlideDataSchema.parse({
      ...baseIframeSlide,
      url: 'https://example.com/embed',
    })

    expect(parsed).toEqual({
      ...baseIframeSlide,
      url: 'https://example.com/embed',
    })
  })

  test('rejects an iframe slide without a URL', () => {
    expect(() => IframeSlideDataSchema.parse(baseIframeSlide)).toThrow()
  })

  test('rejects an iframe slide with an invalid URL', () => {
    expect(() =>
      IframeSlideDataSchema.parse({
        ...baseIframeSlide,
        url: 'not-a-url',
      }),
    ).toThrow()
  })

  test.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
  ])('rejects an iframe slide with unsafe URL scheme %#', (url) => {
    expect(() =>
      IframeSlideDataSchema.parse({
        ...baseIframeSlide,
        url,
      }),
    ).toThrow()
  })
})
