<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ paused: boolean }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const CELL_SIZE = 12
const HEIGHT = 512
const STEP_MS = 100
const EMPTY = 0
const LIFE = 1
const SAND = 2

let columns = 0
let rows = 0
let cells = new Uint8Array()
let nextCells = new Uint8Array()
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
let needsDraw = true
let preferLeft = true

function seedLife() {
  cells = new Uint8Array(columns * rows)
  nextCells = new Uint8Array(columns * rows)
  for (let i = 0; i < cells.length; i++) {
    cells[i] = Math.random() < 0.3 ? LIFE : EMPTY
  }
  needsDraw = true
}

function reseedLife() {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] !== SAND) cells[i] = Math.random() < 0.3 ? LIFE : EMPTY
  }
  needsDraw = true
}

function resize(width: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = Math.max(1, Math.floor(width))
  canvas.height = HEIGHT
  const newColumns = Math.max(4, Math.floor(canvas.width / CELL_SIZE))
  const newRows = Math.floor(HEIGHT / CELL_SIZE)

  if (newColumns !== columns || newRows !== rows) {
    columns = newColumns
    rows = newRows
    seedLife()
    processedSand = new Uint8Array(cells.length)
    pushQueue = new Uint32Array(cells.length)
    pushParent = new Int32Array(cells.length)
    pushSeen = new Uint32Array(cells.length)
  }
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
      if (nextCells[neighbor] === LIFE || nextCells[neighbor] === SAND) continue

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
  nextCells.fill(EMPTY)

  // Compute Life first. A birth can replace sand, which is displaced below.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const index = y * columns + x
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < columns && ny >= 0 && ny < rows) {
            neighbors += Number(cells[ny * columns + nx] === LIFE)
          }
        }
      }

      if (cells[index] === LIFE) {
        nextCells[index] = neighbors === 2 || neighbors === 3 ? LIFE : EMPTY
      } else {
        nextCells[index] = neighbors === 3 ? LIFE : EMPTY
      }
    }
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

  let changed = false
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] !== nextCells[i]) {
      changed = true
      break
    }
  }

  const previousCells = cells
  cells = nextCells
  nextCells = previousCells
  if (!changed) reseedLife()
  needsDraw = true
}

function draw() {
  if (!context || !canvasRef.value) return

  context.fillStyle = '#000'
  context.fillRect(0, 0, canvasRef.value.width, HEIGHT)
  context.fillStyle = '#fff'
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === LIFE) {
      context.fillRect((i % columns) * CELL_SIZE, Math.floor(i / columns) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }
  context.fillStyle = '#e6bd38'
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === SAND) {
      context.fillRect((i % columns) * CELL_SIZE, Math.floor(i / columns) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }
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
  draw()
  needsDraw = false
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
  if (lastTime) elapsed += Math.min(time - lastTime, 250)
  lastTime = time

  while (elapsed >= STEP_MS) {
    step()
    elapsed -= STEP_MS
  }
  if (needsDraw) {
    draw()
    needsDraw = false
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
    if (needsDraw) draw()
    needsDraw = false
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
      if (props.paused) {
        draw()
        needsDraw = false
      }
    }
  })
  resizeObserver.observe(canvas.parentElement || canvas)
  resize(canvas.clientWidth || 300)
  if (props.paused) {
    draw()
    needsDraw = false
  } else {
    startAnimation()
  }
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
