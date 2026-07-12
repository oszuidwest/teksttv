// Single source of truth for the ZuidWest channel palettes.
export type ThemeName = 'green' | 'blue'

export const themes = {
  green: {
    accent: '#82ba26',
    accentDark: '#003500',
    accentMid: '#42ab33',
    accentDeep: '#008c3b',
    tickerBg: '#e0eec9',
    surface: '#e9e9e9',
  },
  blue: {
    accent: '#009fe3',
    accentDark: '#000035',
    accentMid: '#0064d7',
    accentDeep: '#0033cc',
    tickerBg: '#bfe7f8',
    surface: '#e9e9e9',
  },
} as const

export function themeForChannel(channel: string): ThemeName {
  return channel === 'tv1' ? 'green' : 'blue'
}
