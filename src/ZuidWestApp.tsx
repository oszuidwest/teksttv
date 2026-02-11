import App from './App'
import { Frame } from './components/zuidwest/Frame'
import { ImageSlide } from './components/zuidwest/ImageSlide'
import { TextSlide } from './components/zuidwest/TextSlide'
import { Ticker } from './components/zuidwest/Ticker'
import { WeatherSlide } from './components/zuidwest/WeatherSlide'

export default function ZuidWestApp(props: {
  apiBase: string
  channel: string
}) {
  const theme = props.channel === 'tv1' ? 'green' : 'blue'

  return (
    <App
      {...props}
      slides={{
        text: ({ children, ...p }) => (
          <TextSlide {...p} theme={theme}>
            {children}
          </TextSlide>
        ),
        image: ImageSlide,
        weather: ({ children, ...p }) => (
          <WeatherSlide {...p} theme={theme}>
            {children}
          </WeatherSlide>
        ),
      }}
      Ticker={(p) => <Ticker {...p} theme={theme} />}
      Frame={(p) => <Frame {...p} theme={theme} />}
    />
  )
}
