<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let resizeObs: ResizeObserver | null = null

const CELL = 16
const PIPE_W = Math.floor(CELL * 2 / 5)
const MARGIN = Math.floor((CELL - PIPE_W) / 2)
const HALF = Math.floor(CELL / 2)
const STEP_MS = 30
const TURN_CHANCE = 35
const MAX_PIPES = 8

const DIR_DX = [1, 0, -1, 0]
const DIR_DY = [0, 1, 0, -1]
const DIR_RIGHT = 0, DIR_DOWN = 1, DIR_LEFT = 2, DIR_UP = 3

const EMPTY = 0, HORIZ = 1, VERT = 2, C_RD = 3, C_LD = 4, C_RU = 5, C_LU = 6, JOINT = 7

const COLORS = [
  [0,200,80], [220,50,50], [50,120,220], [220,200,50],
  [200,50,200], [50,200,200], [220,140,40], [180,180,180],
]

const COLOR_CACHE = COLORS.map(c => ({
  col: `rgb(${c[0]},${c[1]},${c[2]})`,
  hi:  `rgb(${c[0]+Math.floor((255-c[0])/3)},${c[1]+Math.floor((255-c[1])/3)},${c[2]+Math.floor((255-c[2])/3)})`,
  sh:  `rgb(${Math.floor(c[0]*2/3)},${Math.floor(c[1]*2/3)},${Math.floor(c[2]*2/3)})`,
}))

type Cell = { type: number; ci: number }
type Pipe = { x: number; y: number; dir: number; alive: boolean }

// Per-instance state, reset on each mount to avoid stale data across remounts
let gridW = 0, gridH = 0
let grid: Cell[][] = []
let pipes: Pipe[] = []
let activePipe = 0, totalFilled = 0, lastTime = 0, timer = 0
let ctx: CanvasRenderingContext2D | null = null

function resetState() {
  gridW = 0
  gridH = 0
  grid = []
  pipes = []
  activePipe = 0
  totalFilled = 0
  lastTime = 0
  timer = 0
  ctx = null
}

function resetAll() {
  grid = Array.from({length: gridW}, () => Array.from({length: gridH}, () => ({type: EMPTY, ci: 0})))
  pipes = Array.from({length: MAX_PIPES}, () => ({x:0, y:0, dir:0, alive:false}))
  activePipe = 0
  totalFilled = 0
  timer = 0
  lastTime = 0
  spawnPipe(0)
}

function spawnPipe(idx: number) {
  const p = pipes[idx]
  let attempts = 0
  do {
    p.x = 1 + Math.floor(Math.random() * (gridW - 2))
    p.y = 1 + Math.floor(Math.random() * (gridH - 2))
    if (++attempts > 200) break
  } while (grid[p.x][p.y].type !== EMPTY)
  p.dir = Math.floor(Math.random() * 4)
  p.alive = true
  grid[p.x][p.y].type = JOINT
  grid[p.x][p.y].ci = idx % COLORS.length
  totalFilled++
}

function segType(from: number, to: number) {
  if (from === to) return (from === DIR_LEFT || from === DIR_RIGHT) ? HORIZ : VERT
  if ((from===DIR_RIGHT&&to===DIR_DOWN)||(from===DIR_UP&&to===DIR_LEFT)) return C_LD
  if ((from===DIR_RIGHT&&to===DIR_UP)||(from===DIR_DOWN&&to===DIR_LEFT)) return C_LU
  if ((from===DIR_LEFT&&to===DIR_DOWN)||(from===DIR_UP&&to===DIR_RIGHT)) return C_RD
  if ((from===DIR_LEFT&&to===DIR_UP)||(from===DIR_DOWN&&to===DIR_RIGHT)) return C_RU
  return HORIZ
}

function canMove(x: number, y: number) {
  return x >= 0 && x < gridW && y >= 0 && y < gridH && grid[x][y].type === EMPTY
}

function stepPipe(p: Pipe, ci: number) {
  if (!p.alive) return
  let nd = p.dir
  if (Math.random() * 100 < TURN_CHANCE) {
    nd = Math.random() < 0.5 ? (p.dir + 1) % 4 : (p.dir + 3) % 4
  }
  let nx = p.x + DIR_DX[nd], ny = p.y + DIR_DY[nd]
  if (!canMove(nx, ny)) { nd = p.dir; nx = p.x + DIR_DX[nd]; ny = p.y + DIR_DY[nd] }
  if (!canMove(nx, ny)) {
    for (let d = 0; d < 4; d++) {
      const tx = p.x + DIR_DX[d], ty = p.y + DIR_DY[d]
      if (canMove(tx, ty)) { nd = d; nx = tx; ny = ty; break }
    }
  }
  if (!canMove(nx, ny)) { p.alive = false; return }
  if (p.dir !== nd) { grid[p.x][p.y].type = JOINT; grid[p.x][p.y].ci = ci }
  p.x = nx; p.y = ny; p.dir = nd
  grid[nx][ny].type = segType(p.dir, nd); grid[nx][ny].ci = ci
  totalFilled++
}

function advancePipe() {
  activePipe = (activePipe + 1) % MAX_PIPES
  spawnPipe(activePipe)
}

function r(x: number, y: number, w: number, h: number, color: string) {
  ctx!.fillStyle = color
  ctx!.fillRect(x, y, w, h)
}

function drawCell(gx: number, gy: number) {
  const c = grid[gx][gy]
  if (c.type === EMPTY) return
  const x = gx * CELL, y = gy * CELL
  const { col, hi, sh } = COLOR_CACHE[c.ci]
  const EXT = CELL - MARGIN

  switch (c.type) {
    case HORIZ:
      r(x, y+MARGIN, CELL, PIPE_W, col)
      r(x, y+MARGIN, CELL, 2, hi)
      r(x, y+MARGIN+PIPE_W-2, CELL, 2, sh)
      break
    case VERT:
      r(x+MARGIN, y, PIPE_W, CELL, col)
      r(x+MARGIN, y, 2, CELL, hi)
      r(x+MARGIN+PIPE_W-2, y, 2, CELL, sh)
      break
    case C_RD:
      r(x+HALF, y+MARGIN, HALF, PIPE_W, col)
      r(x+MARGIN, y+HALF, PIPE_W, HALF, col)
      r(x+MARGIN, y+MARGIN, PIPE_W, PIPE_W, col)
      r(x+MARGIN, y+MARGIN, EXT, 2, hi)
      r(x+MARGIN, y+MARGIN, 2, EXT, hi)
      break
    case C_LD:
      r(x, y+MARGIN, HALF, PIPE_W, col)
      r(x+MARGIN, y+HALF, PIPE_W, HALF, col)
      r(x+MARGIN, y+MARGIN, PIPE_W, PIPE_W, col)
      r(x, y+MARGIN, EXT, 2, hi)
      r(x+MARGIN+PIPE_W-2, y+MARGIN, 2, EXT, sh)
      break
    case C_RU:
      r(x+HALF, y+MARGIN, HALF, PIPE_W, col)
      r(x+MARGIN, y, PIPE_W, HALF, col)
      r(x+MARGIN, y+MARGIN, PIPE_W, PIPE_W, col)
      r(x+MARGIN, y, 2, EXT, hi)
      r(x+MARGIN, y+MARGIN+PIPE_W-2, EXT, 2, sh)
      break
    case C_LU:
      r(x, y+MARGIN, HALF, PIPE_W, col)
      r(x+MARGIN, y, PIPE_W, HALF, col)
      r(x+MARGIN, y+MARGIN, PIPE_W, PIPE_W, col)
      r(x, y+MARGIN+PIPE_W-2, EXT, 2, sh)
      r(x+MARGIN+PIPE_W-2, y, 2, EXT, sh)
      break
    case JOINT:
      r(x+MARGIN-2, y+MARGIN-2, PIPE_W+4, PIPE_W+4, col)
      r(x+MARGIN-2, y+MARGIN-2, PIPE_W+4, 2, hi)
      r(x+MARGIN-2, y+MARGIN-2, 2, PIPE_W+4, hi)
      r(x+MARGIN-2, y+MARGIN+PIPE_W, PIPE_W+4, 2, sh)
      r(x+MARGIN+PIPE_W, y+MARGIN-2, 2, PIPE_W+4, sh)
      break
  }
}

function handleResize(width: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = width
  canvas.height = 512
  const newW = Math.max(4, Math.floor(width / CELL))
  const newH = Math.max(4, Math.floor(512 / CELL))
  if (newW !== gridW || newH !== gridH) {
    gridW = newW
    gridH = newH
    resetAll()
  }
}

function frame(ts: number) {
  if (!ctx || !canvasRef.value) return

  if (!lastTime) lastTime = ts
  const dt = ts - lastTime
  lastTime = ts
  timer += dt

  while (timer >= STEP_MS) {
    timer -= STEP_MS
    if (totalFilled > (gridW * gridH * 85) / 100) resetAll()
    let p = pipes[activePipe]
    if (!p.alive) { advancePipe(); p = pipes[activePipe] }
    stepPipe(p, activePipe % COLORS.length)
    if (!p.alive) advancePipe()
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasRef.value.width, 512)
  for (let x = 0; x < gridW; x++)
    for (let y = 0; y < gridH; y++)
      drawCell(x, y)

  animId = requestAnimationFrame(frame)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  resetState()
  ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeObs = new ResizeObserver((entries) => {
    const w = entries[0].contentRect.width
    if (w > 0) handleResize(w)
  })
  resizeObs.observe(canvas.parentElement || canvas)

  handleResize(canvas.clientWidth || 300)
  lastTime = 0
  animId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  resizeObs?.disconnect()
  resetState()
})
</script>

<template>
  <canvas ref="canvasRef" style="width: 100%; height: 512px; display: block;" />
</template>
