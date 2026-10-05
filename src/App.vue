<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Button,
  CursorContext,
  EmojiPickerWindow,
  loadSchemeIndex,
  Typography,
  Window,
  cursorDirective as vCursor,
  customEmojiDirective as vEmoji,
} from 'win-55-ui-vue'
import type { CursorsManifest } from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint'
import Mode7 from './components/Mode7.vue'
import LogoBoxOLD from './components/LogoBoxOLD.vue'
import LifeHelpDialog from './components/LifeHelpDialog.vue'
import { pickCursorScheme } from './helpers/cursorScheme'

const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])
// Change this value to choose which screensaver is built into the banner.
const screensaver: 'pipes' | 'life' = 'life'
const paused = ref(false)
const logoBox = ref<InstanceType<typeof LogoBoxOLD> | null>(null)
const helpDialog = ref<InstanceType<typeof LifeHelpDialog> | null>(null)
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
            v-cursor="'link'"
            extra-class="titlebar-button"
            base-type="panel-d-2"
            :aria-pressed="paused"
            :aria-label="paused ? 'Продолжить симуляцию' : 'Приостановить симуляцию'"
            :title="paused ? 'Продолжить симуляцию' : 'Приостановить симуляцию'"
            @click="paused = !paused"
          >
            <img draggable="false" :src="paused ? '/x-buttons/play.png' : '/x-buttons/pause.png'" alt="" />
          </Button>
          <Button
            v-cursor="'link'"
            extra-class="titlebar-button"
            base-type="panel-d-2"
            aria-label="Заполнить заново"
            title="Заполнить заново"
            @click="logoBox?.refresh()"
          >
            <img draggable="false" src="/x-buttons/refresh.png" alt="" />
          </Button>
          <Button
            v-cursor="'link'"
            extra-class="titlebar-button"
            base-type="panel-d-2"
            aria-label="Очистить"
            title="Очистить"
            @click="logoBox?.clear()"
          >
            <img draggable="false" :src="'/win-55-ui/window/x.png'" alt="" />
          </Button><Button
            v-cursor="'help'"
            extra-class="titlebar-button"
            base-type="panel-d-2"
            aria-label="Справка"
            title="Справка"
            @click="helpDialog?.open()"
          >
            <img draggable="false" src="/x-buttons/help.png" alt="" />
          </Button>
        </template>
        <LogoBoxOLD ref="logoBox" :breakpoint="breakpoint" :screensaver="screensaver" :paused="paused" />
      </Window>
    </div>
    <Typography>
      <router-view />
    </Typography>
    <EmojiPickerWindow />
    <LifeHelpDialog ref="helpDialog" />
  </CursorContext>
</template>
