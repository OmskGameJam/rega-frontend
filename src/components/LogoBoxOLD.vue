<script setup lang="ts">
import { Box } from 'win-55-ui-vue'
import Pipes from './Pipes.vue'
import GameOfLife from './GameOfLife.vue'

defineProps<{
  breakpoint: number
  screensaver: 'pipes' | 'life'
  paused: boolean
}>()
</script>

<template>
  <Box type="indent-dark" extra-class="logo-container" :extra-styles="{width: breakpoint}">
    <router-link to="/">
      <img class="logo" :src="breakpoint > 750 ? '/old-long.png' : '/old-short.png'" />
    </router-link>
    <Pipes v-if="screensaver === 'pipes'" />
    <GameOfLife v-else :paused="paused" />
  </Box>
</template>

<style scoped lang="css">
  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
</style>
