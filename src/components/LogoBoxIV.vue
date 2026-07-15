<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Box } from 'win-55-ui-vue'
import Plasma from './Plasma.vue';

defineProps<{ breakpoint: number }>()

const boxRef = ref<{ $el: HTMLElement } | null>(null)
const logoRef = ref<HTMLImageElement | null>(null)
const plasmaRef = ref<{ triggerBoost: () => void; addRipple: (nx: number, ny: number, strength?: number) => void } | null>(null)
const isSmall = ref(false)
let resizeObserver: ResizeObserver | null = null

const x = ref(20)
const y = ref(30)
const speed = 80 // px/sec
// vx/vy kept at an irrational ratio (sqrt(2)) so the path never falls into a
// repeating cycle and its phase drifts densely across all four corners over time
let vx = speed
let vy = speed * Math.SQRT2
let rafId = 0
let lastTime = 0

const SPEED_BOOST_MULT = 3
const SPEED_BOOST_DECAY_MS = 5000
let speedBoostStart = -Infinity

const updateIsSmall = () => {
  if (!logoRef.value) return
  // offsetWidth is the untransformed layout width, so the scale() applied by .small doesn't skew this
  isSmall.value = logoRef.value.offsetWidth > window.innerWidth / 2
}

const tick = (time: number) => {
  const boxEl = boxRef.value?.$el as HTMLElement | undefined
  const logoEl = logoRef.value

  if (!boxEl || !logoEl) {
    rafId = requestAnimationFrame(tick)
    return
  }

  const dt = lastTime ? (time - lastTime) / 1000 : 0
  lastTime = time

  const speedElapsed = time - speedBoostStart
  const speedDecayProgress = Math.min(1, Math.max(0, speedElapsed / SPEED_BOOST_DECAY_MS))
  const speedMult = speedElapsed < 0 ? 1 : SPEED_BOOST_MULT - (SPEED_BOOST_MULT - 1) * speedDecayProgress

  const buffer = 10
  const topBuffer = 0
  const leftBuffer = 0
  const boxRect = boxEl.getBoundingClientRect()
  const logoRect = logoEl.getBoundingClientRect()

  const minX = leftBuffer
  const minY = topBuffer
  const maxX = boxRect.width - logoRect.width - buffer
  const maxY = boxRect.height - logoRect.height - buffer

  const prevX = x.value
  const prevY = y.value

  x.value += vx * dt * speedMult
  y.value += vy * dt * speedMult

  const boxW = boxRect.width
  const boxH = boxRect.height

  if (x.value <= minX) {
    x.value = minX
    vx = Math.abs(vx)
    plasmaRef.value?.addRipple(0, (y.value + logoRect.height / 2) / boxH)
  } else if (x.value >= maxX) {
    x.value = maxX
    vx = -Math.abs(vx)
    plasmaRef.value?.addRipple(1, (y.value + logoRect.height / 2) / boxH)
  }

  // Jar art has two handles offset from center; their on-screen offsets shrink
  // along with the image itself in 1/3 (small) mode.
  const artScale = isSmall.value ? 1 / 3 : 1
  const centerX = x.value + logoRect.width / 2

  const HANDLE_RIPPLE_STRENGTH = 6

  if (y.value <= minY) {
    y.value = minY
    vy = Math.abs(vy)
    plasmaRef.value?.addRipple((centerX - 78 * artScale) / boxW, 0, HANDLE_RIPPLE_STRENGTH)
    plasmaRef.value?.addRipple((centerX + 66 * artScale) / boxW, 0, HANDLE_RIPPLE_STRENGTH)
  } else if (y.value >= maxY) {
    y.value = maxY
    vy = -Math.abs(vy)
    plasmaRef.value?.addRipple((centerX - 65 * artScale) / boxW, 1, HANDLE_RIPPLE_STRENGTH)
    plasmaRef.value?.addRipple((centerX + 74 * artScale) / boxW, 1, HANDLE_RIPPLE_STRENGTH)
  }

  // Check the whole span travelled this frame (not just the endpoint), since at
  // typical frame speeds the instantaneous position can skip clean over a few-px
  // margin around a corner without ever landing inside it.
  const CORNER_MARGIN = 0
  const withinRange = (a: number, b: number, target: number, margin: number) => {
    const lo = Math.min(a, b) - margin
    const hi = Math.max(a, b) + margin
    return target >= lo && target <= hi
  }
  const corners = [
    [minX, minY], [minX, maxY], [maxX, minY], [maxX, maxY],
  ]
  const hitCorner = corners.some(([cx, cy]) =>
    withinRange(prevX, x.value, cx, CORNER_MARGIN) && withinRange(prevY, y.value, cy, CORNER_MARGIN)
  )
  if (hitCorner) {
    plasmaRef.value?.triggerBoost()
    speedBoostStart = time
  }

  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  resizeObserver = new ResizeObserver(updateIsSmall)
  if (logoRef.value) resizeObserver.observe(logoRef.value)
  window.addEventListener('resize', updateIsSmall)
  updateIsSmall()

  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateIsSmall)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <Box ref="boxRef" type="indent-dark" extra-class="logo-container" :extra-styles="{width: breakpoint}">
    <router-link to="/">
      <img
        ref="logoRef"
        class="logo"
        :class="{ small: isSmall }"
        :style="{ left: x + 'px', top: y + 'px' }"
        src="/jar.png"
      />
    </router-link>
    <Plasma ref="plasmaRef" />
  </Box>
</template>

<style scoped lang="css">
  .logo {
    position: absolute;
  }

  .logo.small {
    transform: scale(0.3333);
    transform-origin: top left;
  }

  img.logo {
    mix-blend-mode: hard-light;
  }
</style>
