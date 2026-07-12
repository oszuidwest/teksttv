/**
 * Renders a local OpenWeatherMap icon and falls back once from day/night
 * variants to the generic SVG.
 */
export function WeatherIcon({
  icon,
  alt,
  className,
}: {
  icon: string
  alt: string
  className?: string
}) {
  return (
    <img
      src={`/icons/weather/${icon}.svg`}
      alt={alt}
      className={className}
      onError={(e) => {
        const img = e.currentTarget
        const fallback = `/icons/weather/${icon.replace(/[dn]$/, '')}.svg`
        if (img.getAttribute('src') === fallback) {
          console.error(
            `Weather icon failed to load, including fallback: ${fallback}`,
          )
          return
        }
        console.warn(
          `Weather icon failed to load: ${img.getAttribute('src')}. Falling back to ${fallback}`,
        )
        img.src = fallback
      }}
    />
  )
}
