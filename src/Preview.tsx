import { useSearchParams } from 'react-router-dom'

export default function Preview() {
  const [searchParams] = useSearchParams()
  const data = searchParams.get('data')

  return (
    <div>
      <h1>Preview</h1>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  )
}
