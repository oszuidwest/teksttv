import type { ComponentType, ReactNode } from 'react'
import type {
  FullScreenSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: ReactNode }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather: ComponentType<{
    content: WeatherSlideData
    children?: ReactNode
  }>
  /**
   * Fills the canvas above frame chrome and renders while inactive; hosts
   * manage persistence, visibility, and refreshes.
   */
  iframe?: IframeSlideComponent
}

/** Iframe renderer contract; `active` mirrors host visibility state. */
export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

/** Station kit consumed by both live playout and preview. */
export interface SlideKit {
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: ReactNode }>
}

/**
 * Renders a non-iframe slide; hosts manage iframe lifecycle separately.
 * Full-screen slides omit the ticker.
 */
export function renderSlide(
  slides: SlideComponents,
  content: Exclude<SlideData, { type: 'iframe' }>,
  ticker: ReactNode,
  key?: number,
): ReactNode {
  switch (content.type) {
    case 'text':
      return (
        <slides.text key={key} content={content}>
          {ticker}
        </slides.text>
      )
    case 'weather':
      return (
        <slides.weather key={key} content={content}>
          {ticker}
        </slides.weather>
      )
    case 'image':
    case 'commercial':
    case 'commercial_transition':
      return <slides.image key={key} content={content} />
  }
}
