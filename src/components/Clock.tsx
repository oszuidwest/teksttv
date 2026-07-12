import { useEffect, useState } from 'react'

export const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span>
      {time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}
