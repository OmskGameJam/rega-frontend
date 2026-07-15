<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let resizeObs: ResizeObserver | null = null

const BUF_W = 128
let bufH = 64

let ctx: CanvasRenderingContext2D | null = null
let imageData: ImageData | null = null
let buf: Uint8ClampedArray | null = null

// HSL -> RGB, h in degrees, s/l in [0,1]
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.floor((r + m) * 255), Math.floor((g + m) * 255), Math.floor((b + m) * 255)]
}

// Precomputed palette: 256 saturated "strawberry jam" RGB triples — hue sweeps
// deep pink through red to orange and back (all via sin, so it stays periodic
// and PALETTE[0]/PALETTE[255] remain adjacent when the index wraps)
const PALETTE: [number, number, number][] = Array.from({ length: 256 }, (_, i) => {
  const a = (i / 256) * Math.PI * 2
  const hue = 345 + 30 * (1 + Math.sin(a)) // oscillates 345deg (pink-red) .. 45deg (orange), wrapping through 0/red
  const saturation = 0.8
  const lightness = 0.42 + 0.1 * Math.sin(a + Math.PI / 4)
  return hslToRgb(hue, saturation, lightness)
})

// Ripple simulation: classic two-buffer wave equation, cheap enough to run at
// full buffer resolution every frame. rippleCur/ripplePrev swap each step.
let rippleCur: Float32Array | null = null
let ripplePrev: Float32Array | null = null

function resetRipple() {
  rippleCur = new Float32Array(BUF_W * bufH)
  ripplePrev = new Float32Array(BUF_W * bufH)
}

function stepRipple() {
  if (!rippleCur || !ripplePrev) return
  const damping = 0.97
  // Include the boundary rows/cols (clamping neighbor lookups) — ripple origins sit
  // right on the box edges, and skipping them left a permanently undamped imprint there.
  for (let y = 0; y < bufH; y++) {
    const yUp = y > 0 ? y - 1 : y
    const yDown = y < bufH - 1 ? y + 1 : y
    for (let x = 0; x < BUF_W; x++) {
      const xLeft = x > 0 ? x - 1 : x
      const xRight = x < BUF_W - 1 ? x + 1 : x
      const i = y * BUF_W + x
      const next =
        (rippleCur[y * BUF_W + xLeft] +
          rippleCur[y * BUF_W + xRight] +
          rippleCur[yUp * BUF_W + x] +
          rippleCur[yDown * BUF_W + x]) /
          2 -
        ripplePrev[i]
      ripplePrev[i] = next * damping
    }
  }
  const swap = rippleCur
  rippleCur = ripplePrev
  ripplePrev = swap
}

// nx/ny are normalized [0,1] coordinates within the box (0,0 = top-left)
function addRipple(nx: number, ny: number, strength = 12) {
  if (!rippleCur) return
  const px = Math.round(nx * (BUF_W - 1))
  const py = Math.round(ny * (bufH - 1))
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = px + dx
      const y = py + dy
      if (x < 0 || x >= BUF_W || y < 0 || y >= bufH) continue
      rippleCur[y * BUF_W + x] += dx === 0 && dy === 0 ? strength : strength * 0.5
    }
  }
}

// Precomputed per-pixel base value (time-independent part of the plasma formula)
let baseTable: Float32Array | null = null

function buildBaseTable() {
  baseTable = new Float32Array(BUF_W * bufH)
  for (let y = 0; y < bufH; y++) {
    for (let x = 0; x < BUF_W; x++) {
      const v =
        Math.sin(x / 16) +
        Math.sin(y / 8) +
        Math.sin((x + y) / 16) +
        Math.sin(Math.sqrt((x - BUF_W / 2) ** 2 + (y - bufH / 2) ** 2) / 8)
      baseTable[y * BUF_W + x] = v
    }
  }
}

const DISPLAY_H = 512

function handleResize(width: number) {
  const canvas = canvasRef.value
  if (!canvas || width <= 0) return

  bufH = Math.max(4, Math.round((BUF_W * DISPLAY_H) / width))

  canvas.width = BUF_W
  canvas.height = bufH

  ctx = canvas.getContext('2d')
  if (!ctx) return

  imageData = ctx.createImageData(BUF_W, bufH)
  buf = imageData.data

  buildBaseTable()
  resetRipple()
}

const BOOST_MULT = 15
const BOOST_DECAY_MS = 1000

let tAccum = 0
let lastFrameTs = 0
let boostStart = -Infinity

function triggerBoost() {
  boostStart = performance.now()
}

defineExpose({ triggerBoost, addRipple })

function frame(ts: number) {
  if (!ctx || !imageData || !buf || !baseTable) {
    animId = requestAnimationFrame(frame)
    return
  }

  const dt = lastFrameTs ? ts - lastFrameTs : 0
  lastFrameTs = ts

  const elapsed = ts - boostStart
  const decayProgress = Math.min(1, Math.max(0, elapsed / BOOST_DECAY_MS))
  const speedMult = elapsed < 0 ? 1 : BOOST_MULT - (BOOST_MULT - 1) * decayProgress

  tAccum += (dt / 50) * speedMult

  stepRipple()

  for (let i = 0, n = BUF_W * bufH; i < n; i++) {
    const v = baseTable[i]
    const h = rippleCur ? rippleCur[i] : 0
    const idx = (Math.floor(((v + 4) / 8) * 256 + tAccum + h * 20)) & 0xff
    const [r, g, b] = PALETTE[idx]
    const p = i * 4
    // ripple crests add a soft highlight, troughs darken slightly — a cheap stand-in for water lighting
    buf[p] = r + h * 18
    buf[p + 1] = g + h * 18
    buf[p + 2] = b + h * 18
    buf[p + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)
  animId = requestAnimationFrame(frame)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  resizeObs = new ResizeObserver((entries) => {
    const { width } = entries[0].contentRect
    handleResize(width)
  })
  const parent = canvas.parentElement || canvas
  resizeObs.observe(parent)

  const rect = parent.getBoundingClientRect()
  handleResize(rect.width || 300)

  animId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  resizeObs?.disconnect()
  ctx = null
  imageData = null
  buf = null
  baseTable = null
  rippleCur = null
  ripplePrev = null
})
</script>

<template>
  <canvas ref="canvasRef" class="plasma" />
</template>

<style scoped lang="css">
  .plasma {
    width: 100%;
    height: 512px;
    display: block;
    image-rendering: pixelated;
  }
</style>
