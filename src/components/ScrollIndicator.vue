<template>
  <div
    v-if="isVisible"
    class="scroll-indicator"
  >
    <img src="/scroll-indicator.gif" alt="Scroll indicator" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 🔧 Config
const SCROLL_THRESHOLD = 100

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY <= SCROLL_THRESHOLD
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // initialize state
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-indicator {
  position: fixed;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none; /* optional: makes it non-clickable */
  z-index: 999999999;
}

.scroll-indicator img {
  display: block;
  width: auto;
  height: auto;
}
</style>