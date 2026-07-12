import { kitForChannel } from './components/zuidwest/kit'
import Preview from './Preview'

export default function ZuidWestPreview(props: { channel: string }) {
  return <Preview {...kitForChannel(props.channel)} />
}
