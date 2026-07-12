import App from './App'
import { kitForChannel } from './components/zuidwest/kit'

export default function ZuidWestApp(props: {
  apiBase: string
  channel: string
}) {
  return <App {...props} {...kitForChannel(props.channel)} />
}
