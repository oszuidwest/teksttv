import { useCallback, useEffect, useReducer } from 'react'
import type { SlideData, TickerItem } from '../types'
import { SlideDataSchema, TickerItemSchema } from '../types'

const urlParams =
  typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search)

const navEnabled = import.meta.env.DEV || (urlParams?.has('nav') ?? false)

const feedOverride = urlParams?.get('feed') ?? null
const channelOverride = urlParams?.get('channel') ?? null

interface State {
  slides: SlideData[]
  nextSlides: SlideData[]
  currentSlide: number
  tickerItems: TickerItem[]
  nextTickerItems: TickerItem[]
  tickerIndex: number
  imagesToPreload: string[]
  paused: boolean
}

type Action =
  | {
      type: 'LOAD_INITIAL'
      slides: SlideData[]
      ticker: TickerItem[]
      imageUrls: string[]
    }
  | {
      type: 'LOAD_NEXT'
      slides: SlideData[]
      ticker: TickerItem[]
      imageUrls: string[]
    }
  | { type: 'TICK' }
  | { type: 'NAV_PREV' }
  | { type: 'NAV_NEXT' }
  | { type: 'TOGGLE_PAUSE' }

const initialState: State = {
  slides: [],
  nextSlides: [],
  currentSlide: 0,
  tickerItems: [],
  nextTickerItems: [],
  tickerIndex: 0,
  imagesToPreload: [],
  paused: false,
}

function imageUrlsFor(slides: SlideData[]): string[] {
  return slides.flatMap((slide) => {
    switch (slide.type) {
      case 'text':
        return slide.image?.url ? [slide.image.url] : []
      case 'image':
      case 'commercial':
      case 'commercial_transition':
        return [slide.url]
      default:
        return []
    }
  })
}

function getValidSlides(value: unknown, source: string): SlideData[] {
  if (!Array.isArray(value)) {
    console.error(`Invalid slides payload from ${source}: expected array`)
    return []
  }

  return value.flatMap((entry, index) => {
    const parsed = SlideDataSchema.safeParse(entry)
    if (!parsed.success) {
      console.error(
        `Skipping invalid slide ${index} from ${source}`,
        parsed.error.issues,
      )
      return []
    }
    return [parsed.data]
  })
}

function getValidTickerItems(value: unknown, source: string): TickerItem[] {
  if (!Array.isArray(value)) {
    console.error(`Invalid ticker payload from ${source}: expected array`)
    return []
  }

  return value.flatMap((entry, index) => {
    const parsed = TickerItemSchema.safeParse(entry)
    if (!parsed.success) {
      console.error(
        `Skipping invalid ticker item ${index} from ${source}`,
        parsed.error.issues,
      )
      return []
    }
    return [parsed.data]
  })
}

function carouselReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_INITIAL':
      return {
        ...state,
        slides: action.slides,
        tickerItems: action.ticker,
        imagesToPreload: action.imageUrls,
      }

    case 'LOAD_NEXT':
      return {
        ...state,
        nextSlides: action.slides,
        nextTickerItems: action.ticker,
        imagesToPreload: [
          ...new Set([...state.imagesToPreload, ...action.imageUrls]),
        ],
      }

    case 'TICK': {
      if (state.slides.length === 0) return state

      const candidate = (state.currentSlide + 1) % state.slides.length
      const swapSlides = candidate === 0 && state.nextSlides.length > 0

      const slides = swapSlides ? state.nextSlides : state.slides
      const nextSlides = swapSlides ? [] : state.nextSlides
      const currentSlide = swapSlides ? 0 : candidate
      // At a slide-set boundary, drop preloaded URLs that the new set doesn't need.
      const imagesToPreload = swapSlides
        ? state.imagesToPreload.filter((url) =>
            imageUrlsFor(state.nextSlides).includes(url),
          )
        : state.imagesToPreload

      let tickerItems = state.tickerItems
      let nextTickerItems = state.nextTickerItems
      let tickerIndex: number

      if (state.tickerItems.length === 0) {
        if (state.nextTickerItems.length > 0) {
          tickerItems = state.nextTickerItems
          nextTickerItems = []
        }
        tickerIndex = 0
      } else {
        const tickerCandidate =
          (state.tickerIndex + 1) % state.tickerItems.length
        if (tickerCandidate === 0 && state.nextTickerItems.length > 0) {
          tickerItems = state.nextTickerItems
          nextTickerItems = []
          tickerIndex = 0
        } else {
          tickerIndex = tickerCandidate
        }
      }

      return {
        ...state,
        slides,
        nextSlides,
        currentSlide,
        imagesToPreload,
        tickerItems,
        nextTickerItems,
        tickerIndex,
      }
    }

    case 'NAV_PREV':
      if (state.slides.length === 0) return state
      return {
        ...state,
        currentSlide:
          (state.currentSlide - 1 + state.slides.length) % state.slides.length,
      }

    case 'NAV_NEXT':
      if (state.slides.length === 0) return state
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % state.slides.length,
      }

    case 'TOGGLE_PAUSE':
      return { ...state, paused: !state.paused }
  }
}

export function useCarousel({
  apiBase: apiBaseProp,
  channel: channelProp,
}: {
  apiBase: string
  channel?: string
}) {
  const apiBase = feedOverride ?? apiBaseProp
  const channel = channelOverride ?? channelProp
  const [state, dispatch] = useReducer(carouselReducer, initialState)

  const fetchData = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        let slidesData: unknown
        let tickerData: unknown

        if (channel) {
          const response = await fetch(`${apiBase}?channel=${channel}`)
          if (!response.ok) {
            throw new Error(
              `Unable to fetch channel feed (status ${response.status})`,
            )
          }
          const data = (await response.json()) as {
            slides?: unknown
            ticker?: unknown
          }
          slidesData = data.slides
          tickerData = data.ticker
        } else {
          const [slidesResponse, tickerResponse] = await Promise.all([
            fetch(`${apiBase}/teksttv-slides`),
            fetch(`${apiBase}/teksttv-ticker`),
          ])
          if (!slidesResponse.ok || !tickerResponse.ok) {
            throw new Error(
              `Unable to fetch feed (slides ${slidesResponse.status}, ticker ${tickerResponse.status})`,
            )
          }
          const [rawSlidesData, rawTickerData] = await Promise.all([
            slidesResponse.json(),
            tickerResponse.json(),
          ])
          slidesData = rawSlidesData
          tickerData = rawTickerData
        }

        const source = channel ? `channel ${channel}` : 'feed'
        const newSlides = getValidSlides(slidesData, source)
        const newTickerItems = getValidTickerItems(tickerData, source)

        if (newSlides.length === 0) {
          throw new Error('Feed returned no valid slides')
        }

        const imageUrls = [...new Set(imageUrlsFor(newSlides))]

        dispatch({
          type: isInitialLoad ? 'LOAD_INITIAL' : 'LOAD_NEXT',
          slides: newSlides,
          ticker: newTickerItems,
          imageUrls,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    [apiBase, channel],
  )

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    const fetchInterval = setInterval(
      () => {
        fetchData(false)
      },
      state.slides.length > 0 ? 5 * 60 * 1000 : 60 * 1000,
    )

    return () => clearInterval(fetchInterval)
  }, [fetchData, state.slides.length])

  useEffect(() => {
    if (!navEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.slides.length === 0) return

      if (e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_PAUSE' })
      } else if (e.key === 'ArrowRight') {
        dispatch({ type: 'NAV_NEXT' })
      } else if (e.key === 'ArrowLeft') {
        dispatch({ type: 'NAV_PREV' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.slides.length])

  useEffect(() => {
    if (state.slides.length === 0) return
    if (state.paused) return
    const currentDuration =
      state.slides[state.currentSlide]?.duration ?? state.slides[0]?.duration
    if (!currentDuration) return

    const timer = setInterval(() => {
      const tick = () => dispatch({ type: 'TICK' })
      if (document.startViewTransition) {
        document.startViewTransition(tick)
      } else {
        tick()
      }
    }, currentDuration)

    return () => clearInterval(timer)
  }, [state.slides, state.currentSlide, state.paused])

  return {
    slides: state.slides,
    currentSlide: state.currentSlide,
    tickerItems: state.tickerItems,
    tickerIndex: state.tickerIndex,
    imagesToPreload: state.imagesToPreload,
    paused: state.paused,
    navEnabled,
  }
}
