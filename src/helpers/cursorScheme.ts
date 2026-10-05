import type { CursorsManifest, SchemeIndex } from 'win-55-ui-vue'

export function pickCursorScheme(
  schemes: SchemeIndex,
  manifest: CursorsManifest,
  random: () => number = Math.random,
): string | undefined {
  const animated: string[] = []
  const stationary: string[] = []

  for (const [slug, scheme] of Object.entries(schemes)) {
    if (slug.includes('inverted')) continue

    const hasAnimation = Object.values(scheme.roles).some(id => {
      const cursor = manifest[id]
      return cursor?.animated && cursor.frameCount > 1
        && (cursor.nativeFrameDelays?.length ?? 0) > 1
        && cursor.hotspotX !== null && cursor.hotspotY !== null
    })
    const pool = hasAnimation ? animated : stationary
    pool.push(slug)
  }

  const preferred = random() < 0.7 ? animated : stationary
  const pool = preferred.length > 0 ? preferred : [...animated, ...stationary]
  return pool.length > 0 ? pool[Math.floor(random() * pool.length)] : undefined
}
