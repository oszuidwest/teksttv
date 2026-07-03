import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { z } from 'zod'
import type { SlideData, TickerItem } from '../types'
import { SlideDataSchema, TickerItemSchema } from '../types'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
// Poll faster until the first successful load.
const INITIAL_RETRY_INTERVAL_MS = 60 * 1000

const navEnabled = (() => {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('nav')
})()

interface State {
  slides: SlideData[]
  nextSlides: SlideData[]
  currentSlide: number
  tickerItems: TickerItem[]
  nextTickerItems: TickerItem[]
  tickerIndex: number
  paused: boolean
}

type Action =
  | { type: 'LOAD_INITIAL'; slides: SlideData[]; ticker: TickerItem[] }
  | { type: 'LOAD_NEXT'; slides: SlideData[]; ticker: TickerItem[] }
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

// Per-item validation at the trust boundary: one malformed entry is skipped
// (and logged) instead of rejecting the whole feed.
function getValidItems<T>(
  schema: z.ZodType<T>,
  value: unknown,
  source: string,
  kind: string,
): T[] {
  if (!Array.isArray(value)) {
    console.error(`Invalid ${kind} payload from ${source}: expected array`)
    return []
  }

  return value.flatMap((entry, index) => {
    const parsed = schema.safeParse(entry)
    if (!parsed.success) {
      console.error(
        `Skipping invalid ${kind} ${index} from ${source}`,
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
      return { ...state, slides: action.slides, tickerItems: action.ticker }

    case 'LOAD_NEXT':
      return {
        ...state,
        nextSlides: action.slides,
        nextTickerItems: action.ticker,
      }

    case 'TICK': {
      if (state.slides.length === 0) return state

      // Slides and ticker advance independently; each swaps in its pending
      // "next" set when its own cycle wraps around.
      const candidate = (state.currentSlide + 1) % state.slides.length
      const swapSlides = candidate === 0 && state.nextSlides.length > 0

      const tickerLen = state.tickerItems.length
      const tickerCandidate =
        tickerLen === 0 ? 0 : (state.tickerIndex + 1) % tickerLen
      const swapTicker =
        tickerCandidate === 0 && state.nextTickerItems.length > 0

      return {
        ...state,
        slides: swapSlides ? state.nextSlides : state.slides,
        nextSlides: swapSlides ? [] : state.nextSlides,
        currentSlide: swapSlides ? 0 : candidate,
        tickerItems: swapTicker ? state.nextTickerItems : state.tickerItems,
        nextTickerItems: swapTicker ? [] : state.nextTickerItems,
        tickerIndex: swapTicker ? 0 : tickerCandidate,
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
  apiBase,
  channel,
}: {
  apiBase: string
  channel?: string
}) {
  const [state, dispatch] = useReducer(carouselReducer, initialState)
  const lastPayloadRef = useRef<string | null>(null)

  const fetchData = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        let payloadText: string
        let slidesData: unknown
        let tickerData: unknown

        if (channel) {
          const response = await fetch(`${apiBase}/teksttv?channel=${channel}`)
          if (!response.ok) {
            throw new Error(
              `Unable to fetch channel feed (status ${response.status})`,
            )
          }
          payloadText = await response.text()
          const data = JSON.parse(payloadText) as {
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
          const [slidesText, tickerText] = await Promise.all([
            slidesResponse.text(),
            tickerResponse.text(),
          ])
          payloadText = `${slidesText}\n${tickerText}`
          slidesData = JSON.parse(slidesText)
          tickerData = JSON.parse(tickerText)
        }

        // Feeds change a few times a day at most; skip the parse/dispatch/
        // re-render churn when the payload is byte-identical.
        if (!isInitialLoad && payloadText === lastPayloadRef.current) return

        const source = channel ? `channel ${channel}` : 'feed'
        const newSlides = getValidItems(
          SlideDataSchema,
          slidesData,
          source,
          'slide',
        )
        const newTickerItems = getValidItems(
          TickerItemSchema,
          tickerData,
          source,
          'ticker item',
        )

        if (newSlides.length === 0) {
          throw new Error('Feed returned no valid slides')
        }

        lastPayloadRef.current = payloadText
        dispatch({
          type: isInitialLoad ? 'LOAD_INITIAL' : 'LOAD_NEXT',
          slides: newSlides,
          ticker: newTickerItems,
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

  const hasSlides = state.slides.length > 0

  useEffect(() => {
    const fetchInterval = setInterval(
      () => {
        fetchData(false)
      },
      hasSlides ? REFRESH_INTERVAL_MS : INITIAL_RETRY_INTERVAL_MS,
    )

    return () => clearInterval(fetchInterval)
  }, [fetchData, hasSlides])

  useEffect(() => {
    if (!navEnabled) return

    // The reducer already no-ops NAV actions on an empty deck.
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [])

  useEffect(() => {
    if (state.slides.length === 0) return
    if (state.paused) return
    const currentDuration = state.slides[state.currentSlide].duration

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

  // Derived, not stored: everything the current and pending slide sets need.
  const imagesToPreload = useMemo(
    () => [...new Set(imageUrlsFor([...state.slides, ...state.nextSlides]))],
    [state.slides, state.nextSlides],
  )

  return {
    slides: state.slides,
    currentSlide: state.currentSlide,
    tickerItems: state.tickerItems,
    tickerIndex: state.tickerIndex,
    imagesToPreload,
    paused: state.paused,
    navEnabled,
  }
}
