<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ paused: boolean; logoImage?: HTMLImageElement | null }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const CELL_SIZE = 6
const HEIGHT = 512
const STEP_MS = 50
const EMITTER_DELAY_MS = 5000
const EMPTY = 0
const LIFE = 1
const SAND = 2
const WALL = 3

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
let preferLeft = true
let emitterX: number | null = null
let emitterWait = 0
let logoPixels: ImageData | null = null

function reset(randomFill: boolean) {
  emitterX = null
  emitterWait = 0
  lastTime = 0
  elapsed = 0
  preferLeft = true
  if (randomFill) {
    seedLife()
  } else {
    cells.fill(EMPTY)
    nextCells.fill(EMPTY)
    projectWalls()
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

function updateEmitter(delta: number) {
  const canvas = canvasRef.value
  if (!canvas || !columns) return

  if (emitterX === null) {
    emitterWait += delta
    if (emitterWait < EMITTER_DELAY_MS) return
    emitterX = 0
    emitterWait = 0
  } else if (emitterX >= canvas.width - 1) {
    emitterX = null
    emitterWait = 0
    return
  } else {
    emitterX++
  }

  // The emitter moves in canvas pixels; sand uses the existing cell grid.
  const index = Math.min(columns - 1, Math.floor(emitterX / CELL_SIZE))
  if (cells[index] === EMPTY) cells[index] = SAND
}

function seedLife() {
  cells = new Uint8Array(columns * rows)
  nextCells = new Uint8Array(columns * rows)
  for (let i = 0; i < cells.length; i++) {
    cells[i] = Math.random() < 0.3 ? LIFE : EMPTY
  }
  projectWalls()
}

function resize(width: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const newWidth = Math.max(1, Math.floor(width))
  const widthChanged = canvas.width !== newWidth
  canvas.width = newWidth
  canvas.height = HEIGHT
  const newColumns = Math.max(4, Math.floor(canvas.width / CELL_SIZE))
  const newRows = Math.floor(HEIGHT / CELL_SIZE)

  if (newColumns !== columns || newRows !== rows) {
    columns = newColumns
    rows = newRows
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

function step() {
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
  if (emitterX !== null) context.fillRect(emitterX, 0, 1, 1)
}

function place(event: PointerEvent, material: typeof LIFE | typeof SAND) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) * canvas.width / rect.width / CELL_SIZE)
  const y = Math.floor((event.clientY - rect.top) * canvas.height / rect.height / CELL_SIZE)
  if (x < 0 || x >= columns || y < 0 || y >= rows) return

  const index = y * columns + x
  if (cells[index] !== EMPTY) return
  cells[index] = material
  if (props.paused) draw()
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.button !== 2) return
  event.preventDefault()
  const canvas = event.currentTarget as HTMLCanvasElement
  canvas.setPointerCapture(event.pointerId)
  place(event, event.button === 0 ? SAND : LIFE)
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons & 1) place(event, SAND)
  else if (event.buttons & 2) place(event, LIFE)
}

function animate(time: number) {
  frameId = 0
  if (!context || props.paused) return
  const delta = lastTime ? time - lastTime : 0
  elapsed += Math.min(delta, 250)
  lastTime = time

  updateEmitter(delta)
  while (elapsed >= STEP_MS) {
    step()
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
  <canvas
    ref="canvasRef"
    style="width: 100%; height: 512px; display: block; touch-action: none;"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @contextmenu.prevent
  />
</template>
