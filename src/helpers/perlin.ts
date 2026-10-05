/** A freshly shuffled 2D Perlin field with values in [-1, 1]. */
export function createPerlinNoise(random: () => number = Math.random) {
  const permutation = Uint8Array.from({ length: 256 }, (_, index) => index)
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const value = permutation[i]
    permutation[i] = permutation[j]
    permutation[j] = value
  }

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  function gradient(hash: number, x: number, y: number) {
    switch (hash & 7) {
      case 0: return x
      case 1: return -x
      case 2: return y
      case 3: return -y
      case 4: return (x + y) * Math.SQRT1_2
      case 5: return (x - y) * Math.SQRT1_2
      case 6: return (-x + y) * Math.SQRT1_2
      default: return (-x - y) * Math.SQRT1_2
    }
  }
  const hash = (x: number, y: number) => permutation[(permutation[x & 255] + y) & 255]

  return (x: number, y: number) => {
    const gridX = Math.floor(x)
    const gridY = Math.floor(y)
    const dx = x - gridX
    const dy = y - gridY
    const u = fade(dx)
    const v = fade(dy)
    const top = lerp(gradient(hash(gridX, gridY), dx, dy),
      gradient(hash(gridX + 1, gridY), dx - 1, dy), u)
    const bottom = lerp(gradient(hash(gridX, gridY + 1), dx, dy - 1),
      gradient(hash(gridX + 1, gridY + 1), dx - 1, dy - 1), u)
    return Math.max(-1, Math.min(1, lerp(top, bottom, v) * Math.SQRT2))
  }
}
