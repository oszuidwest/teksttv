type RGB = [number, number, number]
type ColorStop = [number, RGB]

const tempScale: ColorStop[] = [
  [-10, [123, 104, 174]],
  [-5, [123, 104, 174]],
  [0, [91, 155, 213]],
  [5, [126, 200, 200]],
  [10, [140, 198, 63]],
  [15, [196, 216, 46]],
  [20, [245, 210, 59]],
  [25, [240, 149, 59]],
  [30, [226, 75, 59]],
  [35, [160, 32, 32]],
]

function interpolateColor(temp: number): RGB {
  if (temp <= tempScale[0][0]) return tempScale[0][1]
  if (temp >= tempScale[tempScale.length - 1][0])
    return tempScale[tempScale.length - 1][1]
  for (let i = 0; i < tempScale.length - 1; i++) {
    const [t0, c0] = tempScale[i]
    const [t1, c1] = tempScale[i + 1]
    if (temp >= t0 && temp <= t1) {
      const t = (temp - t0) / (t1 - t0)
      return [
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
      ]
    }
  }
  return tempScale[0][1]
}

function luminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function tempStyle(temp: number) {
  const [r, g, b] = interpolateColor(temp)
  return {
    backgroundColor: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
    color: luminance(r, g, b) > 0.4 ? '#1d1d1b' : '#ffffff',
  }
}
