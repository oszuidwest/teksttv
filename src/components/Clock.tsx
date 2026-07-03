import { useEffect, useState } from 'react'

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  hour: '2-digit',
  minute: '2-digit',
})

export const Clock = () => {
  // Store the formatted string, not the Date: identical strings let React
  // bail out of the 59 re-renders per minute that change nothing on screen.
  const [time, setTime] = useState(() => timeFormatter.format(new Date()))

  useEffect(() => {
    const timer = setInterval(
      () => setTime(timeFormatter.format(new Date())),
      1000,
    )
    return () => clearInterval(timer)
  }, [])

  return <span>{time}</span>
}
