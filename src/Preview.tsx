import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { ImageSlideComponent } from './components/ImageSlideComponent'
import { TextSlideComponent } from './components/TextSlideComponent'
import { Ticker } from './components/Ticker'
import { SlideDataSchema } from './types'

export default function Preview() {
  const [searchParams] = useSearchParams()
  const encodedData = searchParams.get('data')

  if (!encodedData) {
    return <div>Error: No data provided</div>
  }

  try {
    const decodedData = atob(encodedData)
    const parsedData = JSON.parse(decodedData)
    const validatedData = SlideDataSchema.parse(parsedData)

    return (
      <div className="relative h-[1080px] w-[1920px]">
        {validatedData.type === 'image' ? (
          <ImageSlideComponent content={validatedData} />
        ) : (
          <TextSlideComponent content={validatedData} />
        )}
        <Ticker items={[{ message: 'Sample Ticker' }]} currentIndex={0} />
      </div>
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return <div>Validation Error: {error.message}</div>
    }
    if (error instanceof SyntaxError) {
      return <div>JSON Parsing Error: {error.message}</div>
    }
    return <div>Error: Unable to process the provided data</div>
  }
}
