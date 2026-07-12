import type { ComponentType, ReactNode } from 'react'
import type {
  FullScreenSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

/** Components required to render each supported slide variant. */
export interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: ReactNode }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather: ComponentType<{
    content: WeatherSlideData
    children?: ReactNode
  }>
  /**
   * Optional iframe renderer. It must fill the slide canvas above frame chrome
   * and render when inactive; App owns persistence, visibility, and refreshes.
   */
  iframe?: IframeSlideComponent
}

/** Iframe renderer contract; `active` describes the host visibility state. */
export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

/** Station-specific render kit shared by live playout and preview. */
export interface SlideKit {
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: ReactNode }>
}

/** Renders one slide with a station kit; full-screen slides ignore the ticker. */
export function renderSlide(
  slides: SlideComponents,
  content: SlideData,
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
    case 'iframe': {
      // App pre-filters iframe slides into its persistent layer; this fallback
      // is for Preview only.
      const IframeSlide = slides.iframe
      if (!IframeSlide) {
        return <div>Iframe slides worden niet ondersteund door dit thema</div>
      }
      return (
        <div key={key} className="pointer-events-none">
          <IframeSlide url={content.url} active />
        </div>
      )
    }
    case 'image':
    case 'commercial':
    case 'commercial_transition':
      return <slides.image key={key} content={content} />
  }
}
