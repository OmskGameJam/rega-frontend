<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"

type Align = "left" | "center" | "right"
type Mode = "columns" | "auto-column"

interface Props {
  align?: Align
  gap?: number
  marginGap?: boolean
  mode?: Mode
  columns?: number
  elementWidth?: number | null,
  useOffsets?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  align: "left",
  gap: 32,
  marginGap: true,
  mode: "columns",
  columns: 3,
  elementWidth: null,
  useOffsets: false
})

const container = ref<HTMLElement>()
const children = ref<HTMLElement[]>([])

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

function collectChildren() {
  if (!container.value) return
  children.value = Array.from(container.value.children) as HTMLElement[]
}

// 🆕 Read per-child offsets
function getOffset(el: HTMLElement) {

  if (!props.useOffsets) { return {x: 0, y: 0}}
  const x = Number(el.dataset.offsetX ?? 0)
  const y = Number(el.dataset.offsetY ?? 0)

  return {
    x: isNaN(x) ? 0 : x,
    y: isNaN(y) ? 0 : y,
  }
}

function layout() {
  if (!container.value) return

  const width = container.value.clientWidth
  const gap = props.gap
  const marginGap = props.marginGap ? gap : 0

  let itemWidth = 0
  let columns = 1

  // -------------------------
  // COLUMN CALCULATION
  // -------------------------

  if (props.mode === "auto-column") {
    itemWidth = props.elementWidth ?? 200

    columns = Math.max(
      1,
      Math.floor((width - marginGap * 2 + gap) / (itemWidth + gap))
    )
  } else {
    columns = Math.max(1, props.columns)

    if (props.elementWidth !== null) {
      itemWidth = props.elementWidth
    } else {
      const totalGap = gap * (columns - 1) + marginGap * 2
      itemWidth = (width - totalGap) / columns
    }
  }

  // 🔒 Snap width once
  itemWidth = Math.floor(itemWidth)

  // -------------------------
  // CONTENT WIDTH (NO MARGINS)
  // -------------------------

  const contentWidth =
    columns * itemWidth +
    (columns - 1) * gap

  // -------------------------
  // ALIGNMENT
  // -------------------------

  let offsetX = 0

  if (props.align === "left") {
    offsetX = marginGap
  }

  if (props.align === "center") {
    offsetX = Math.floor((width - contentWidth) / 2)
  }

  if (props.align === "right") {
    offsetX = Math.floor(width - contentWidth - marginGap)
  }

  // -------------------------
  // PASS 1: APPLY WIDTHS
  // -------------------------

  children.value.forEach(child => {
    child.style.position = "absolute"
    child.style.width = itemWidth + "px"
  })

  // -------------------------
  // PASS 2: POSITIONING + OFFSETS
  // -------------------------

  let x = offsetX
  let y = marginGap
  let rowHeight = 0

  children.value.forEach((child, i) => {
    const h = Math.ceil(child.offsetHeight)

    const offset = getOffset(child) // 🆕 get per-child offset

    child.style.left = Math.floor(x + offset.x) + "px"
    child.style.top = Math.floor(y + offset.y) + "px"

    rowHeight = Math.max(rowHeight, h)

    if ((i + 1) % columns === 0) {
      x = offsetX
      y += rowHeight + gap
      rowHeight = 0
    } else {
      x += itemWidth + gap
    }
  })

  const height = y + rowHeight + marginGap
  container.value.style.height = Math.ceil(height) + "px"
}

function relayout() {
  collectChildren()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      layout()
    })
  })
}

onMounted(() => {
  collectChildren()

  resizeObserver = new ResizeObserver(relayout)
  mutationObserver = new MutationObserver(relayout)

  if (!container.value) return

  resizeObserver.observe(container.value)
  mutationObserver.observe(container.value, {
    childList: true,
    subtree: false
  })

  window.addEventListener("resize", relayout)
  relayout()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  window.removeEventListener("resize", relayout)
})

watch(() => ({ ...props }), relayout)
</script>

<template>
  <div
    ref="container"
    style="
      position: relative;
      width: 100%;
      box-sizing: border-box;
    "
  >
    <slot />
  </div>
</template>