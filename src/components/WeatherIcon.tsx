// Resolves an OWM icon code to a local SVG. If the day/night variant is
// missing, falls back once to the generic icon; the dataset guard prevents an
// endless error→retry loop when the fallback is missing too.
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
        if (
          img.dataset.fallbackApplied === 'true' ||
          img.getAttribute('src') === fallback
        ) {
          console.error(
            `Weather icon failed to load, including fallback: ${fallback}`,
          )
          img.dataset.fallbackApplied = 'true'
          return
        }
        console.warn(
          `Weather icon failed to load: ${img.getAttribute('src')}. Falling back to ${fallback}`,
        )
        img.dataset.fallbackApplied = 'true'
        img.src = fallback
      }}
    />
  )
}
