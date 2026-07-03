import { kits } from './components/zuidwest/kit'
import { themeForChannel } from './components/zuidwest/theme'
import Preview from './Preview'

export default function ZuidWestPreview(props: { channel: string }) {
  return <Preview {...kits[themeForChannel(props.channel)]} />
}
