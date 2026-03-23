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

const isVisible = ref(true)
const isPermanentlyHidden = ref(false)

const handleScroll = () => {
  if (isPermanentlyHidden.value) return

  if (window.scrollY > SCROLL_THRESHOLD) {
    isVisible.value = false
    isPermanentlyHidden.value = true

    // Optional: stop listening once done
    window.removeEventListener('scroll', handleScroll)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
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
  pointer-events: none;
  z-index: 999999999;
}

.scroll-indicator img {
  display: block;
  width: auto;
  height: auto;
}
</style>