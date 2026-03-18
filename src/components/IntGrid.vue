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
  elementWidth?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  align: "left",
  gap: 32,
  marginGap: true,
  mode: "columns",
  columns: 3,
  elementWidth: null
})

const container = ref<HTMLElement>()
const children = ref<HTMLElement[]>([])

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

function collectChildren() {
  if (!container.value) return
  children.value = Array.from(container.value.children) as HTMLElement[]
}

function layout() {
  if (!container.value) return

  const width = Math.floor(container.value.clientWidth)
  const gap = Math.floor(props.gap)
  const marginGap = props.marginGap ? gap : 0

  let itemWidth = 0
  let columns = 1

  // -------------------------
  // AUTO COLUMN MODE
  // -------------------------

  if (props.mode === "auto-column") {
    itemWidth = Math.floor(props.elementWidth ?? 200)

    columns = Math.max(
      1,
      Math.floor((width - marginGap * 2 + gap) / (itemWidth + gap))
    )
  }

  // -------------------------
  // COLUMN MODE
  // -------------------------

  else {
    columns = Math.max(1, props.columns)

    // enforced width
    if (props.elementWidth !== null) {
      itemWidth = Math.floor(props.elementWidth)
    } 
    // calculated width
    else {
      const totalGap = gap * (columns - 1) + marginGap * 2
      itemWidth = Math.floor((width - totalGap) / columns)
    }
  }

  const usedWidth = columns * itemWidth + (columns - 1) * gap
  const freeSpace = width - usedWidth

  // -------------------------
  // ALIGNMENT
  // -------------------------

  let offsetX = marginGap

  if (props.align === "center") offsetX = Math.floor(freeSpace / 2)
  if (props.align === "right") offsetX = Math.floor(freeSpace - marginGap)

  let x = offsetX
  let y = marginGap
  let rowHeight = 0

  children.value.forEach((child, i) => {
    child.style.position = "absolute"
    child.style.width = itemWidth + "px"

    const rect = child.getBoundingClientRect()
    const h = Math.floor(rect.height)

    child.style.left = Math.floor(x) + "px"
    child.style.top = Math.floor(y) + "px"

    rowHeight = Math.max(rowHeight, h)

    if ((i + 1) % columns === 0) {
      x = offsetX
      y = Math.floor(y + rowHeight + gap)
      rowHeight = 0
    } else {
      x = Math.floor(x + itemWidth + gap)
    }
  })

  const height = Math.floor(y + rowHeight + marginGap)
  container.value.style.height = height + "px"
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
  relayout()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(() => ({ ...props }), relayout)
</script>

<template>
  <div ref="container" style="position: relative; width: 100%;">
    <slot />
  </div>
</template>