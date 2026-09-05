import App from './App'
import { bredanuKit } from './components/bredanu/kit'

export default function BredaNuApp(props: {
  apiBase: string
  channel?: string
}) {
  return <App {...props} {...bredanuKit} />
}
