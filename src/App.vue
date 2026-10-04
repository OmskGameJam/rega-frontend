<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Button,
  CursorContext,
  EmojiPickerWindow,
  loadSchemeIndex,
  Typography,
  Window,
  customEmojiDirective as vEmoji,
} from 'win-55-ui-vue'
import type { CursorsManifest } from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint'
import Mode7 from './components/Mode7.vue'
import LogoBoxOLD from './components/LogoBoxOLD.vue'
import { pickCursorScheme } from './helpers/cursorScheme'

const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])
// Change this value to choose which screensaver is built into the banner.
const screensaver: 'pipes' | 'life' = 'life'
const paused = ref(false)
const cursorScheme = ref<string>()

onMounted(async () => {
  const schemes = await loadSchemeIndex()
  let manifest: CursorsManifest = {}
  try {
    const response = await fetch('/win-55-ui/cursors/manifest.json')
    if (response.ok) manifest = await response.json()
  } catch {
    // Keep uniform selection available if animation metadata cannot be fetched.
  }
  cursorScheme.value = pickCursorScheme(schemes, manifest)
})
</script>

<template>
  <CursorContext root :scheme="cursorScheme">
    <Mode7 v-if="breakpoint > 720" />
    <div v-emoji>
      <Window v-if="$route.path !== '/registration'" icon="/icons/pipes.png" faux title="Welcome!" style="margin: 32px">
        <template v-if="screensaver === 'life'" #titlebar-buttons>
          <Button
            extra-class="titlebar-button"
            base-type="panel-d-2"
            :aria-label="paused ? 'Продолжить симуляцию' : 'Приостановить симуляцию'"
            @click="paused = !paused"
          >
            {{ paused ? '▶' : 'Ⅱ' }}
          </Button>
        </template>
        <LogoBoxOLD :breakpoint="breakpoint" :screensaver="screensaver" :paused="paused" />
      </Window>
    </div>
    <Typography>
      <router-view />
    </Typography>
    <EmojiPickerWindow />
  </CursorContext>
</template>
