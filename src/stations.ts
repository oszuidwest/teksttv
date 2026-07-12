// CMS feed roots per broadcaster, shared by the station pages. ZuidWest runs
// in channel mode, which expects a complete payload endpoint (/teksttv);
// Rucphen uses the split slides/ticker endpoints under the namespace root.
export const ZUIDWEST_API_BASE =
  'https://www.zuidwestupdate.nl/wp-json/zw/v1/teksttv'
export const RUCPHEN_API_BASE = 'https://cms.tv-krant.nl/wp-json/zw/v1'
