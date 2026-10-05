<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Emoji } from 'win-55-ui-vue'
import { BOID_EMOJI_SIZE, BOID_SIZE, createBoidEntrance, stepBoids, type Boid } from '../helpers/boids'
import { createPerlinNoise } from '../helpers/perlin'

const props = defineProps<{ paused: boolean; logoImage?: HTMLImageElement | null }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const backgroundImage = ref('')
const boids = ref<Boid[]>([])
const emitterCursors = ref<{ slot: number; x: number; opacity: number }[]>([])
const emojiInset = Math.floor((BOID_SIZE - BOID_EMOJI_SIZE) / 2)
const CELL_SIZE = 6
const HEIGHT = 512
const BACKGROUND_ROWS = Math.ceil(HEIGHT / CELL_SIZE)
const BACKGROUND_LEVELS = 5
const BACKGROUND_COLORS = Array.from({ length: BACKGROUND_LEVELS }, (_, level) => {
  const blue = Math.round(0x44 * (1 - level / (BACKGROUND_LEVELS - 1)))
  return `#0000${blue.toString(16).padStart(2, '0')}`
})
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const STEP_MS = 50
const MAX_EMITTERS = 3
const EMITTER_FADE_IN_MS = 500
const EMITTER_FADE_OUT_MS = 500
// The native sprite is 32px with its hotspot at (10, 10).
const EMITTER_CURSOR_SRC = '/win-55-ui/cursors/windows-default-default/native.gif'
const EMITTER_CURSOR_SIZE = 32
const EMITTER_CURSOR_HOTSPOT = 10
const EMITTER_SPAWN_MIN_MS = 3000
const EMITTER_SPAWN_MAX_MS = 10000
const EMITTER_LIFE_MIN_MS = 1000
const EMITTER_LIFE_MAX_MS = 3000
const EMITTER_SPEED_MIN = 40 // Canvas pixels per second.
const EMITTER_SPEED_MAX = 180
const EMPTY = 0
const LIFE = 1
const SAND = 2
const WALL = 3
const CHUNK_SIZE = 32
const LIFE_NOISE_SCALE = 48 // Grid cells per Perlin lattice interval.
const LIFE_NOISE_CUTOFF = 0.3 // Only noise above this value can spawn Life; probability remains the noise value.

let columns = 0
let rows = 0
let cells = new Uint8Array()
let nextCells = new Uint8Array()
let lifeRowSums = new Uint8Array()
let processedSand = new Uint8Array()
let pushQueue = new Uint32Array()
let pushParent = new Int32Array()
let pushSeen = new Uint32Array()
let pushSearchId = 0
let context: CanvasRenderingContext2D | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let lastTime = 0
let elapsed = 0
let boidEntrance = createBoidEntrance()
let preferLeft = true
type SandEmitter = { x: number; velocity: number; remainingMs: number; fadeInMs: number; fadeOutMs: number }
type EmitterSlot = { emitter: SandEmitter | null; waitMs: number }
let emitterSlots: EmitterSlot[] = []
let logoPixels: ImageData | null = null
let chunkColumns = 0
let chunkRows = 0
let activeChunks = new Uint8Array()
let nextActiveChunks = new Uint8Array()
let stroke: { pointerId: number; material: typeof LIFE | typeof SAND; erase: boolean } | null = null

function wakeChunk(chunks: Uint8Array, chunkX: number, chunkY: number) {
  for (let y = Math.max(0, chunkY - 1); y <= Math.min(chunkRows - 1, chunkY + 1); y++) {
    for (let x = Math.max(0, chunkX - 1); x <= Math.min(chunkColumns - 1, chunkX + 1); x++) {
      chunks[y * chunkColumns + x] = 1
    }
  }
}

function wakeCell(x: number, y: number) {
  wakeChunk(activeChunks, Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE))
}

function reset(randomFill: boolean) {
  boids.value = []
  boidEntrance = createBoidEntrance()
  stroke = null
  resetEmitters()
  lastTime = 0
  elapsed = 0
  preferLeft = true
  if (randomFill) {
    seedLife()
  } else {
    cells.fill(EMPTY)
    nextCells.fill(EMPTY)
    projectWalls()
    activeChunks.fill(0)
  }
  context?.clearRect(0, 0, canvasRef.value?.width ?? 0, HEIGHT)
  draw()
}

defineExpose({
  clear: () => reset(false),
  refresh: () => reset(true),
})

function projectWalls() {
  const canvas = canvasRef.value
  const logo = props.logoImage
  if (!canvas || !logo || !logoPixels) return

  const canvasRect = canvas.getBoundingClientRect()
  const logoRect = logo.getBoundingClientRect()
  if (!canvasRect.width || !canvasRect.height) return

  const scaleX = canvas.width / canvasRect.width / CELL_SIZE
  const scaleY = canvas.height / canvasRect.height / CELL_SIZE
  const left = (logoRect.left - canvasRect.left) * scaleX
  const top = (logoRect.top - canvasRect.top) * scaleY
  const pixelWidth = logoRect.width / logoPixels.width * scaleX
  const pixelHeight = logoRect.height / logoPixels.height * scaleY

  // Mark every grid cell touched by a visible, pure-white source pixel.
  // Read at native resolution so colored pixels never blend into the mask.
  for (let y = 0; y < logoPixels.height; y++) {
    for (let x = 0; x < logoPixels.width; x++) {
      const offset = (y * logoPixels.width + x) * 4
      const pixels = logoPixels.data
      if (pixels[offset] !== 255 || pixels[offset + 1] !== 255
        || pixels[offset + 2] !== 255 || pixels[offset + 3] === 0) continue

      const firstX = Math.max(0, Math.floor(left + x * pixelWidth))
      const lastX = Math.min(columns - 1, Math.ceil(left + (x + 1) * pixelWidth) - 1)
      const firstY = Math.max(0, Math.floor(top + y * pixelHeight))
      const lastY = Math.min(rows - 1, Math.ceil(top + (y + 1) * pixelHeight) - 1)
      for (let row = firstY; row <= lastY; row++) {
        for (let column = firstX; column <= lastX; column++) {
          cells[row * columns + column] = WALL
        }
      }
    }
  }
}

function loadLogoPixels() {
  const logo = props.logoImage
  if (!logo?.complete || !logo.naturalWidth) return
  const mask = document.createElement('canvas')
  mask.width = logo.naturalWidth
  mask.height = logo.naturalHeight
  const maskContext = mask.getContext('2d')
  if (!maskContext) return
  maskContext.drawImage(logo, 0, 0)
  logoPixels = maskContext.getImageData(0, 0, mask.width, mask.height)
  seedLife()
  context?.clearRect(0, 0, canvasRef.value?.width ?? 0, HEIGHT)
  draw()
}

watch(() => props.logoImage, (logo, _previous, onCleanup) => {
  logoPixels = null
  if (!logo) return
  logo.addEventListener('load', loadLogoPixels)
  onCleanup(() => logo.removeEventListener('load', loadLogoPixels))
  loadLogoPixels()
}, { flush: 'post', immediate: true })

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function resetEmitters() {
  emitterCursors.value = []
  emitterSlots = Array.from({ length: MAX_EMITTERS }, () => ({
    emitter: null,
    waitMs: randomBetween(EMITTER_SPAWN_MIN_MS, EMITTER_SPAWN_MAX_MS),
  }))
}

function updateEmitters(delta: number) {
  const canvas = canvasRef.value
  if (!canvas || !columns) return

  const maxX = Math.max(0, canvas.width - 1)
  for (const slot of emitterSlots) {
    if (slot.emitter) {
      if (slot.emitter.remainingMs <= 0) {
        slot.emitter.fadeOutMs = Math.max(0, slot.emitter.fadeOutMs - delta)
        if (slot.emitter.fadeOutMs === 0) {
          slot.emitter = null
          slot.waitMs = randomBetween(EMITTER_SPAWN_MIN_MS, EMITTER_SPAWN_MAX_MS)
        }
        continue
      }
      if (slot.emitter.fadeInMs > 0) {
        slot.emitter.fadeInMs = Math.max(0, slot.emitter.fadeInMs - delta)
        // Hold the cursor at the spawn point until its fade finishes.
        if (slot.emitter.fadeInMs > 0) continue
      } else {
        slot.emitter.remainingMs -= delta
        if (slot.emitter.remainingMs <= 0) {
          continue
        }
        slot.emitter.x += slot.emitter.velocity * delta / 1000
        // Bounce at the edges so every emitter gets its full lifetime.
        if (slot.emitter.x < 0 || slot.emitter.x > maxX) {
          slot.emitter.x = Math.max(0, Math.min(maxX, slot.emitter.x))
          slot.emitter.velocity = -slot.emitter.velocity
        }
      }
    } else {
      slot.waitMs -= delta
      if (slot.waitMs > 0) continue
      // Averaging two samples favors the center while keeping the full width available.
      const x = (Math.random() + Math.random()) / 2 * maxX
      const speed = randomBetween(EMITTER_SPEED_MIN, EMITTER_SPEED_MAX)
      let direction = Math.random() < 0.5 ? -1 : 1
      // Give an outward direction one reroll, without forcing the result inward.
      if ((x - maxX / 2) * direction > 0) {
        direction = Math.random() < 0.5 ? -1 : 1
      }
      slot.emitter = {
        x,
        velocity: speed * direction,
        remainingMs: randomBetween(EMITTER_LIFE_MIN_MS, EMITTER_LIFE_MAX_MS),
        fadeInMs: EMITTER_FADE_IN_MS,
        fadeOutMs: EMITTER_FADE_OUT_MS,
      }
      continue
    }

    // One grain per active emitter per tick, independent of display FPS.
    const index = Math.min(columns - 1, Math.floor(slot.emitter.x / CELL_SIZE))
    if (cells[index] === EMPTY) {
      cells[index] = SAND
      wakeCell(index, 0)
    }
  }
  emitterCursors.value = emitterSlots.flatMap((slot, index) => slot.emitter ? [{
    slot: index,
    x: slot.emitter.x,
    opacity: slot.emitter.remainingMs <= 0
      ? slot.emitter.fadeOutMs / EMITTER_FADE_OUT_MS
      : 1 - slot.emitter.fadeInMs / EMITTER_FADE_IN_MS,
  }] : [])
}

function seedLife() {
  resetEmitters()
  boids.value = []
  boidEntrance = createBoidEntrance()
  cells = new Uint8Array(columns * rows)
  nextCells = new Uint8Array(columns * rows)
  const noise = createPerlinNoise()
  const offsetX = Math.random() * 256
  const offsetY = Math.random() * 256
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const chance = noise(offsetX + x / LIFE_NOISE_SCALE, offsetY + y / LIFE_NOISE_SCALE)
      cells[y * columns + x] = chance > LIFE_NOISE_CUTOFF && Math.random() < chance ? LIFE : EMPTY
    }
  }
  projectWalls()
  activeChunks.fill(1)
}

function updateBoids() {
  boids.value = stepBoids({ cells, columns, rows, cellSize: CELL_SIZE }, boids.value, boidEntrance, STEP_MS)
}

function createBackground(width: number) {
  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = HEIGHT
  const layerContext = layer.getContext('2d')
  if (!layerContext) return null

  for (let y = 0; y < BACKGROUND_ROWS; y++) {
    const level = y / (BACKGROUND_ROWS - 1) * (BACKGROUND_LEVELS - 1)
    const lower = Math.floor(level)
    // Leave solid bands around a dithered transition spanning 40% of each interval.
    const blend = Math.max(0, Math.min(1, (level - lower - 0.3) / 0.4))
    for (let x = 0; x < Math.ceil(width / CELL_SIZE); x++) {
      const threshold = (BAYER_4[(y % 4) * 4 + x % 4] + 0.5) / 16
      const color = Math.min(BACKGROUND_LEVELS - 1, lower + Number(blend > threshold))
      layerContext.fillStyle = BACKGROUND_COLORS[color]
      layerContext.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }
  return layer
}

function resize(width: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const newWidth = Math.max(1, Math.floor(width))
  const widthChanged = canvas.width !== newWidth
  canvas.width = newWidth
  canvas.height = HEIGHT
  if (!backgroundImage.value || widthChanged) {
    backgroundImage.value = createBackground(newWidth)?.toDataURL('image/png') ?? ''
  }
  const newColumns = Math.max(4, Math.floor(canvas.width / CELL_SIZE))
  const newRows = Math.floor(HEIGHT / CELL_SIZE)

  if (newColumns !== columns || newRows !== rows) {
    columns = newColumns
    rows = newRows
    chunkColumns = Math.ceil(columns / CHUNK_SIZE)
    chunkRows = Math.ceil(rows / CHUNK_SIZE)
    activeChunks = new Uint8Array(chunkColumns * chunkRows)
    nextActiveChunks = new Uint8Array(activeChunks.length)
    // Empty border rows remove edge checks from the neighbor-counting pass.
    lifeRowSums = new Uint8Array((rows + 2) * columns)
    processedSand = new Uint8Array(columns * rows)
    pushQueue = new Uint32Array(columns * rows)
    pushParent = new Int32Array(columns * rows)
    pushSeen = new Uint32Array(columns * rows)
    seedLife()
  } else if (widthChanged) {
    // Even a sub-cell resize changes the centered logo's projection.
    seedLife()
  }
  draw()
}

function pushSand(source: number): boolean {
  if (pushSearchId >= 0xffff_ffff) {
    pushSeen.fill(0)
    pushSearchId = 1
  } else {
    pushSearchId++
  }

  let head = 0
  let tail = 0
  let destination = -1
  pushQueue[tail++] = source
  pushSeen[source] = pushSearchId

  while (head < tail && destination < 0) {
    const current = pushQueue[head++]
    const x = current % columns
    const y = Math.floor(current / columns)
    const side = preferLeft ? -1 : 1
    for (let direction = 0; direction < 3; direction++) {
      let neighbor = -1
      if (direction === 0 && y > 0) neighbor = current - columns
      if (direction === 1 && x + side >= 0 && x + side < columns) neighbor = current + side
      if (direction === 2 && x - side >= 0 && x - side < columns) neighbor = current - side
      if (neighbor < 0 || pushSeen[neighbor] === pushSearchId) continue
      if (nextCells[neighbor] !== EMPTY) continue

      if (cells[neighbor] === SAND) {
        if (processedSand[neighbor]) continue
        pushSeen[neighbor] = pushSearchId
        pushParent[neighbor] = current
        pushQueue[tail++] = neighbor
      } else if (nextCells[neighbor] === EMPTY) {
        pushSeen[neighbor] = pushSearchId
        pushParent[neighbor] = current
        destination = neighbor
        break
      }
    }
  }

  if (destination < 0) return false

  let current = destination
  while (current !== source) {
    if (cells[current] === SAND) processedSand[current] = 1
    nextCells[current] = SAND
    current = pushParent[current]
  }
  return true
}

function stepFullGrid() {
  // Cache horizontal triples once instead of visiting all eight neighbors per cell.
  for (let y = 0; y < rows; y++) {
    const row = y * columns
    const sumsRow = row + columns
    let left = 0
    let center = Number(cells[row] === LIFE)
    for (let x = 0; x < columns; x++) {
      const right = Number(x + 1 < columns && cells[row + x + 1] === LIFE)
      lifeRowSums[sumsRow + x] = left + center + right
      left = center
      center = right
    }
  }

  // Compute Life first. A birth can replace sand, which is displaced below.
  // Every destination is assigned here, so nextCells needs no separate clearing pass.
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === WALL) {
      nextCells[i] = WALL
      continue
    }
    const alive = Number(cells[i] === LIFE)
    const neighbors = lifeRowSums[i] + lifeRowSums[i + columns]
      + lifeRowSums[i + 2 * columns] - alive
    nextCells[i] = neighbors === 3 || (alive && neighbors === 2) ? LIFE : EMPTY
  }

  processedSand.fill(0)
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === SAND && nextCells[i] === LIFE) {
      processedSand[i] = 1
      pushSand(i)
    }
  }

  preferLeft = !preferLeft

  // Move sand bottom-up. When blocked, try both diagonals to form slopes.
  for (let y = rows - 1; y >= 0; y--) {
    for (let x = 0; x < columns; x++) {
      const index = y * columns + x
      if (cells[index] !== SAND || processedSand[index] || nextCells[index] === LIFE) continue

      if (y === rows - 1) continue // Sand leaves the canvas at the bottom.

      const below = index + columns
      if (nextCells[below] === EMPTY) {
        nextCells[below] = SAND
      } else {
        const firstDiagonal = preferLeft && x > 0
          ? index + columns - 1
          : !preferLeft && x + 1 < columns
            ? index + columns + 1
            : -1
        const secondDiagonal = preferLeft && x + 1 < columns
          ? index + columns + 1
          : !preferLeft && x > 0
            ? index + columns - 1
            : -1

        if (firstDiagonal >= 0 && nextCells[firstDiagonal] === EMPTY) {
          nextCells[firstDiagonal] = SAND
        } else if (secondDiagonal >= 0 && nextCells[secondDiagonal] === EMPTY) {
          nextCells[secondDiagonal] = SAND
        } else {
          nextCells[index] = SAND
        }
      }
    }
  }

  const previousCells = cells
  cells = nextCells
  nextCells = previousCells
}

function step() {
  // Avoid chunk traversal overhead while the entire grid is active.
  if (!activeChunks.includes(0)) {
    stepFullGrid()
    updateChunkActivity()
    return
  }

  // Sleeping chunks have unchanged Life/empty/wall cells and no sand. Copying
  // preserves their stable state and prevents old buffer contents reappearing.
  nextCells.set(cells)

  // Cache horizontal triples for active chunks, including their source row halo.
  for (let chunkY = 0; chunkY < chunkRows; chunkY++) {
    const firstY = Math.max(0, chunkY * CHUNK_SIZE - 1)
    const lastY = Math.min(rows, (chunkY + 1) * CHUNK_SIZE + 1)
    for (let chunkX = 0; chunkX < chunkColumns; chunkX++) {
      if (!activeChunks[chunkY * chunkColumns + chunkX]) continue
      const firstX = chunkX * CHUNK_SIZE
      const lastX = Math.min(columns, firstX + CHUNK_SIZE)
      for (let y = firstY; y < lastY; y++) {
        const row = y * columns
        const sumsRow = row + columns
        let left = Number(firstX > 0 && cells[row + firstX - 1] === LIFE)
        let center = Number(cells[row + firstX] === LIFE)
        for (let x = firstX; x < lastX; x++) {
          const right = Number(x + 1 < columns && cells[row + x + 1] === LIFE)
          lifeRowSums[sumsRow + x] = left + center + right
          left = center
          center = right
        }
      }
    }
  }

  // Compute Life first. A birth can replace sand, which is displaced below.
  for (let y = 0; y < rows; y++) {
    const row = y * columns
    const chunkRow = Math.floor(y / CHUNK_SIZE) * chunkColumns
    for (let chunkX = 0; chunkX < chunkColumns; chunkX++) {
      if (!activeChunks[chunkRow + chunkX]) continue
      const lastX = Math.min(columns, (chunkX + 1) * CHUNK_SIZE)
      for (let x = chunkX * CHUNK_SIZE; x < lastX; x++) {
        const i = row + x
        if (cells[i] === WALL) continue
        const alive = Number(cells[i] === LIFE)
        const neighbors = lifeRowSums[i] + lifeRowSums[i + columns]
          + lifeRowSums[i + 2 * columns] - alive
        nextCells[i] = neighbors === 3 || (alive && neighbors === 2) ? LIFE : EMPTY
      }
    }
  }

  processedSand.fill(0)
  // Keep the original row-major order, even across chunk boundaries.
  for (let y = 0; y < rows; y++) {
    const row = y * columns
    const chunkRow = Math.floor(y / CHUNK_SIZE) * chunkColumns
    for (let chunkX = 0; chunkX < chunkColumns; chunkX++) {
      if (!activeChunks[chunkRow + chunkX]) continue
      const lastX = Math.min(columns, (chunkX + 1) * CHUNK_SIZE)
      for (let x = chunkX * CHUNK_SIZE; x < lastX; x++) {
        const i = row + x
        if (cells[i] === SAND && nextCells[i] === LIFE) {
          processedSand[i] = 1
          pushSand(i)
        }
      }
    }
  }

  preferLeft = !preferLeft

  // Move sand bottom-up. When blocked, try both diagonals to form slopes.
  for (let y = rows - 1; y >= 0; y--) {
    const chunkRow = Math.floor(y / CHUNK_SIZE) * chunkColumns
    for (let chunkX = 0; chunkX < chunkColumns; chunkX++) {
      if (!activeChunks[chunkRow + chunkX]) continue
      const lastX = Math.min(columns, (chunkX + 1) * CHUNK_SIZE)
      for (let x = chunkX * CHUNK_SIZE; x < lastX; x++) {
        const index = y * columns + x
        if (cells[index] !== SAND || processedSand[index] || nextCells[index] === LIFE) continue

        if (y === rows - 1) continue // Sand leaves the canvas at the bottom.

        const below = index + columns
        if (nextCells[below] === EMPTY) {
          nextCells[below] = SAND
        } else {
          const firstDiagonal = preferLeft && x > 0
            ? index + columns - 1
            : !preferLeft && x + 1 < columns
              ? index + columns + 1
              : -1
          const secondDiagonal = preferLeft && x + 1 < columns
            ? index + columns + 1
            : !preferLeft && x > 0
              ? index + columns - 1
              : -1

          if (firstDiagonal >= 0 && nextCells[firstDiagonal] === EMPTY) {
            nextCells[firstDiagonal] = SAND
          } else if (secondDiagonal >= 0 && nextCells[secondDiagonal] === EMPTY) {
            nextCells[secondDiagonal] = SAND
          } else {
            nextCells[index] = SAND
          }
        }
      }
    }
  }

  const previousCells = cells
  cells = nextCells
  nextCells = previousCells
  updateChunkActivity()
}

function updateChunkActivity() {
  // Unchanged Life chunks sleep until a neighboring chunk changes. Sand chunks
  // stay awake in both diagonal phases, including every possible push path.
  nextActiveChunks.fill(0)
  for (let chunkY = 0; chunkY < chunkRows; chunkY++) {
    const lastY = Math.min(rows, (chunkY + 1) * CHUNK_SIZE)
    for (let chunkX = 0; chunkX < chunkColumns; chunkX++) {
      if (!activeChunks[chunkY * chunkColumns + chunkX]) continue
      const lastX = Math.min(columns, (chunkX + 1) * CHUNK_SIZE)
      let needsNextTick = false
      for (let y = chunkY * CHUNK_SIZE; y < lastY && !needsNextTick; y++) {
        const row = y * columns
        for (let x = chunkX * CHUNK_SIZE; x < lastX; x++) {
          const i = row + x
          if (cells[i] === SAND || cells[i] !== nextCells[i]) {
            needsNextTick = true
            break
          }
        }
      }
      if (needsNextTick) wakeChunk(nextActiveChunks, chunkX, chunkY)
    }
  }

  const previousActiveChunks = activeChunks
  activeChunks = nextActiveChunks
  nextActiveChunks = previousActiveChunks
}

function draw() {
  if (!context || !canvasRef.value) return

  context.fillStyle = '#00004477'
  context.fillRect(0, 0, canvasRef.value.width, HEIGHT)
  // Batch adjacent cells while keeping canvas style changes outside the hot loop.
  for (let material = LIFE; material <= SAND; material++) {
    context.fillStyle = material === LIFE ? '#fff' : '#e6bd38'
    for (let y = 0; y < rows; y++) {
      const row = y * columns
      let x = 0
      while (x < columns) {
        if (cells[row + x] !== material) {
          x++
          continue
        }
        const start = x++
        while (x < columns && cells[row + x] === material) x++
        context.fillRect(start * CELL_SIZE, y * CELL_SIZE, (x - start) * CELL_SIZE, CELL_SIZE)
      }
    }
  }
  for (const slot of emitterSlots) {
    if (slot.emitter && slot.emitter.fadeInMs === 0 && slot.emitter.remainingMs > 0) {
      context.fillRect(Math.round(slot.emitter.x), 0, 1, 1)
    }
  }
}

function pointerCell(event: PointerEvent): number {
  const canvas = canvasRef.value
  if (!canvas) return -1
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) * canvas.width / rect.width / CELL_SIZE)
  const y = Math.floor((event.clientY - rect.top) * canvas.height / rect.height / CELL_SIZE)
  if (x < 0 || x >= columns || y < 0 || y >= rows) return -1
  return y * columns + x
}

function place(event: PointerEvent, material: typeof LIFE | typeof SAND, erase: boolean) {
  const index = pointerCell(event)
  if (index < 0 || cells[index] === WALL) return
  if (erase && cells[index] !== material) return
  const replacement = erase ? EMPTY : material
  if (cells[index] === replacement) return
  cells[index] = replacement
  wakeCell(index % columns, Math.floor(index / columns))
  if (props.paused) draw()
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.button !== 2) return
  event.preventDefault()
  const index = pointerCell(event)
  if (index < 0) return
  const material = event.button === 0 ? SAND : LIFE
  stroke = { pointerId: event.pointerId, material, erase: cells[index] === material }
  const canvas = event.currentTarget as HTMLCanvasElement
  canvas.setPointerCapture(event.pointerId)
  place(event, stroke.material, stroke.erase)
}

function onPointerMove(event: PointerEvent) {
  if (!stroke || stroke.pointerId !== event.pointerId) return
  const button = stroke.material === SAND ? 1 : 2
  if (event.buttons & button) place(event, stroke.material, stroke.erase)
  else stroke = null
}

function endStroke(event: PointerEvent) {
  if (stroke?.pointerId === event.pointerId) stroke = null
}

function animate(time: number) {
  frameId = 0
  if (!context || props.paused) return
  const delta = lastTime ? time - lastTime : 0
  elapsed += Math.min(delta, 250)
  lastTime = time

  while (elapsed >= STEP_MS) {
    updateEmitters(STEP_MS)
    step()
    updateBoids()
    draw()
    elapsed -= STEP_MS
  }
  frameId = requestAnimationFrame(animate)
}

function startAnimation() {
  if (!props.paused && context && !frameId) {
    frameId = requestAnimationFrame(animate)
  }
}

watch(() => props.paused, paused => {
  lastTime = 0
  elapsed = 0
  if (paused) {
    cancelAnimationFrame(frameId)
    frameId = 0
  } else {
    startAnimation()
  }
})

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  context = canvas.getContext('2d')
  if (!context) return

  resizeObserver = new ResizeObserver(entries => {
    const width = entries[0]?.contentRect.width ?? 0
    if (width > 0) {
      resize(width)
    }
  })
  resizeObserver.observe(canvas.parentElement || canvas)
  resize(canvas.clientWidth || 300)
  startAnimation()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  context = null
})
</script>

<template>
  <div class="life-world">
    <canvas
      ref="canvasRef"
      style="width: 100%; height: 512px; display: block; touch-action: none;"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endStroke"
      @pointercancel="endStroke"
      @lostpointercapture="endStroke"
      @contextmenu.prevent
    />
    <img
      v-if="backgroundImage"
      class="background-overlay"
      :src="backgroundImage"
      alt=""
      aria-hidden="true"
      :draggable="false"
    />
    <div class="boid-overlay" aria-hidden="true">
      <Emoji
        v-for="boid in boids"
        :key="boid.id"
        class="boid"
        :emoji="boid.emoji"
        :style="{ left: `${Math.round(boid.x + emojiInset)}px`, top: `${Math.round(boid.y + emojiInset)}px`, width: `${BOID_EMOJI_SIZE}px`, height: `${BOID_EMOJI_SIZE}px` }"
      />
    </div>
    <div class="emitter-overlay" aria-hidden="true">
      <img
        v-for="cursor in emitterCursors"
        :key="cursor.slot"
        class="emitter-cursor"
        :src="EMITTER_CURSOR_SRC"
        alt=""
        :draggable="false"
        :style="{
          left: `${Math.round(cursor.x) - EMITTER_CURSOR_HOTSPOT}px`,
          top: `${-EMITTER_CURSOR_HOTSPOT}px`,
          width: `${EMITTER_CURSOR_SIZE}px`,
          height: `${EMITTER_CURSOR_SIZE}px`,
          opacity: cursor.opacity,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.life-world {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 512px;
}

.background-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  mix-blend-mode: difference;
  transform: scaleY(-1);
  image-rendering: pixelated;
  pointer-events: none;
  user-select: none;
}

.boid-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.boid {
  position: absolute;
  max-width: none;
  image-rendering: pixelated;
}

.emitter-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}

.emitter-cursor {
  position: absolute;
  max-width: none;
  image-rendering: pixelated;
}
</style>
