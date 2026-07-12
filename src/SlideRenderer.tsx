import type { ComponentType, ReactNode } from 'react'
import type {
  FullScreenSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

export interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: ReactNode }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather: ComponentType<{
    content: WeatherSlideData
    children?: ReactNode
  }>
  // The App host keeps one instance per distinct URL mounted so embeds load
  // once and stay warm; it hides inactive instances, disables pointer
  // interaction, and may remount inactive instances on a slow interval to
  // recover from transient load failures. Preview renders one active
  // instance directly. The component must fill the canvas above the frame
  // chrome (z-40, like full-screen image slides) and must render the frame
  // regardless of `active` — the host handles hiding.
  iframe?: IframeSlideComponent
}

export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

// Everything App and Preview need to render a station: its slide components,
// ticker, and optional frame chrome. Station kits implement this shape.
export interface SlideKit {
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: ReactNode }>
}

// Single dispatch shared by live playout (App) and Preview so the two can
// never drift. Full-screen slides (image/commercial) play without a ticker.
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
      // Only Preview reaches this branch: App pre-filters iframe slides into
      // its persistent layer, so the fallback below never appears on air.
      // Aliased because biome's useIframeTitle mistakes <slides.iframe> for a
      // raw <iframe> element.
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
