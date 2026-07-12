const SENSITIVE_SEARCH_PARAM_PATTERN =
  /(?:token|key|secret|password|passwd|pwd|auth|signature|sig|bearer|credential)/i

function createBaseFeedUrl(
  apiBase: string,
  locationHref = window.location.href,
) {
  return new URL(apiBase, locationHref)
}

export function createChannelFeedUrl(
  apiBase: string,
  channel: string,
  locationHref = window.location.href,
) {
  const url = createBaseFeedUrl(apiBase, locationHref)
  url.searchParams.set('channel', channel)
  return url
}

export function createSplitFeedEndpointUrl(
  apiBase: string,
  endpoint: 'teksttv-slides' | 'teksttv-ticker',
  locationHref = window.location.href,
) {
  const url = createBaseFeedUrl(apiBase, locationHref)
  const basePath = url.pathname.replace(/\/+$/, '')
  url.pathname = `${basePath}/${endpoint}`
  return url
}

export function formatFeedUrlForDisplay(url: URL) {
  const safeUrl = new URL(url)
  safeUrl.username = ''
  safeUrl.password = ''
  safeUrl.hash = ''

  for (const key of new Set(safeUrl.searchParams.keys())) {
    if (SENSITIVE_SEARCH_PARAM_PATTERN.test(key)) {
      safeUrl.searchParams.set(key, 'redacted')
    }
  }

  return safeUrl.toString()
}
