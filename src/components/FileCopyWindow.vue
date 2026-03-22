<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Box, Typography } from 'win-55-ui-vue'

const props = withDefaults(defineProps<{
  currentStep: number
  totalSteps: number
}>(), {
  currentStep: 0,
  totalSteps: 10,
})

const FILE_PATHS = [
  'C:\\Windows\\System\\vgaoem.fon',
  'C:\\Windows\\System\\serife.fon',
  'C:\\Windows\\System\\coure.fon',
  'C:\\Program Files\\GameJam\\rega.dll',
  'C:\\Program Files\\GameJam\\data\\levels.pak',
  'C:\\Windows\\System\\msvcp60.dll',
  'C:\\Program Files\\GameJam\\textures\\icon.bmp',
  'C:\\Windows\\Temp\\~GLF0001.tmp',
  'C:\\Program Files\\GameJam\\sounds\\click.wav',
  'C:\\Windows\\System\\oleaut32.dll',
  'C:\\Program Files\\GameJam\\config.ini',
  'C:\\Windows\\System\\msvcrt.dll',
  'C:\\Program Files\\GameJam\\readme.txt',
  'C:\\Windows\\System\\comctl32.dll',
  'C:\\Program Files\\GameJam\\uninstall.exe',
]

const TOTAL_CHUNKS = 23
const MAX_PATH_LENGTH = 34

const currentFileIndex = ref(Math.floor(Math.random() * FILE_PATHS.length))
let fileTimer: ReturnType<typeof setTimeout> | null = null

function scheduleNextFile() {
  const delay = 300 + Math.random() * 9700
  fileTimer = setTimeout(() => {
    currentFileIndex.value = Math.floor(Math.random() * FILE_PATHS.length)
    scheduleNextFile()
  }, delay)
}

onMounted(() => {
  scheduleNextFile()
})

onUnmounted(() => {
  if (fileTimer !== null) {
    clearTimeout(fileTimer)
  }
})

const progress = computed(() => props.currentStep / props.totalSteps)
const filledChunks = computed(() => Math.floor(progress.value * TOTAL_CHUNKS))

const displayPath = computed(() => {
  const path = FILE_PATHS[currentFileIndex.value]
  if (path.length <= MAX_PATH_LENGTH) return path
  const keep = Math.floor((MAX_PATH_LENGTH - 3) / 2)
  return path.slice(0, keep) + '...' + path.slice(-keep)
})
</script>

<template>
  <div class="file-copy-anchor">
    <Typography font-color="black">
      <Box type="panel-d-1" :extra-styles="{ width: '420px', padding: '12px 16px' }">
        <Typography shorthand="Bold12" font-color="black">
          Копирование файлов...
        </Typography>
        <br />
        <br />
        <div>
          <Typography shorthand="Regular12" font-color="black">
            {{ displayPath }}
          </Typography>
        </div>
        <div class="progress-track">
          <div
            v-for="i in filledChunks"
            :key="i"
            class="progress-chunk"
          />
        </div>
      </Box>
    </Typography>
  </div>
</template>

<style scoped>
.file-copy-anchor {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 50;
}

.progress-track {
  height: 28px;
  margin-top: 12px;
  display: flex;
  align-items: stretch;
  gap: 2px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background: #c0c0c0;
  padding: 2px;
}

.progress-chunk {
  width: 14px;
  background: #000080;
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .file-copy-anchor :deep(.box) {
    width: calc(100vw - 16px) !important;
  }
}
</style>
