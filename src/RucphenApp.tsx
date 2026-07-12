import App from './App'
import { rucphenKit } from './components/rucphen/kit'

export default function RucphenApp(props: {
  apiBase: string
  channel?: string
}) {
  return <App {...props} {...rucphenKit} />
}
