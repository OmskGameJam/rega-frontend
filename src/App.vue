<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CursorContext, loadSchemeIndex, Typography, Window } from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint';
import Mode7 from './components/Mode7.vue';
import LogoBoxOLD from './components/LogoBoxOLD.vue';
import { pickCursorScheme } from './helpers/cursorScheme'
import type { CursorsManifest } from 'win-55-ui-vue'
const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])
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

import { customEmojiDirective as vEmoji, EmojiPickerWindow } from 'win-55-ui-vue';


</script>

<template>
  <CursorContext root :scheme="cursorScheme">
    <Mode7 v-if="breakpoint > 720" />
    <div v-emoji>
      <Window v-if="$route.path !== '/registration'" icon="/icons/pipes.png" faux title="Welcome!" style="margin: 32px">
        <LogoBoxOLD :breakpoint="breakpoint" />
      </Window>
    </div>
    <Typography>
      <router-view />
    </Typography>
    <EmojiPickerWindow />
  </CursorContext>
</template>
