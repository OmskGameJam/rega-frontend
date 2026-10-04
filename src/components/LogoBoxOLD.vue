<script setup lang="ts">
import { Box, cursorDirective as vCursor } from 'win-55-ui-vue'
import Pipes from './Pipes.vue'
import GameOfLife from './GameOfLife.vue'
import { ref } from 'vue'

const logoRef = ref<HTMLImageElement | null>(null)
const gameRef = ref<InstanceType<typeof GameOfLife> | null>(null)

defineExpose({
  clear: () => gameRef.value?.clear(),
  refresh: () => gameRef.value?.refresh(),
})

defineProps<{
  breakpoint: number
  screensaver: 'pipes' | 'life'
  paused: boolean
}>()
</script>

<template>
  <Box type="indent-dark" extra-class="logo-container" :extra-styles="{width: breakpoint}">
    <router-link to="/">
      <img ref="logoRef" v-cursor="'link'" class="logo" :src="breakpoint > 750 ? '/old-long.png' : '/old-short.png'" />
    </router-link>
    <Pipes v-if="screensaver === 'pipes'" />
    <GameOfLife v-else ref="gameRef" :paused="paused" :logo-image="logoRef" />
    <div v-if="screensaver === 'life'" class="life-intro" aria-hidden="true" />
  </Box>
</template>

<style scoped lang="css">
  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }

  .life-intro {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: black;
    pointer-events: none;
    animation: life-fade-in 2s linear forwards;
  }

  @keyframes life-fade-in {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      visibility: hidden;
    }
  }
</style>
