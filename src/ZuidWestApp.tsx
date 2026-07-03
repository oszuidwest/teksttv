import App from './App'
import { kits } from './components/zuidwest/kit'
import { themeForChannel } from './components/zuidwest/theme'

export default function ZuidWestApp(props: {
  apiBase: string
  channel: string
}) {
  return <App {...props} {...kits[themeForChannel(props.channel)]} />
}
