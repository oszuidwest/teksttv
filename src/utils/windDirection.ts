// Rotation for a wind arrow that points where the wind blows *to*, so south
// wind (Z) points up (0°) and north wind (N) points down (180°). Dutch compass
// abbreviations at 22.5° steps.
const dirMap: Record<string, number> = {
  N: 180,
  NNO: 202.5,
  NO: 225,
  ONO: 247.5,
  O: 270,
  OZO: 292.5,
  ZO: 315,
  ZZO: 337.5,
  Z: 0,
  ZZW: 22.5,
  ZW: 45,
  WZW: 67.5,
  W: 90,
  WNW: 112.5,
  NW: 135,
  NNW: 157.5,
}

export function windRotation(direction: string): number {
  return dirMap[direction] ?? 0
}
