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

/**
 * Returns the rotation for a downwind arrow: Z points up, N points down, and
 * each Dutch compass step adds 22.5 degrees.
 */
export function windRotation(direction: string): number {
  return dirMap[direction] ?? 0
}
