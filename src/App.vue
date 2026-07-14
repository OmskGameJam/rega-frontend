<script setup lang="ts">
import { Typography, Window} from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint';
import Mode7 from './components/Mode7.vue';
import LogoBoxIV from './components/LogoBoxIV.vue';
const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])

import { customEmojiDirective as vEmoji, EmojiPickerWindow } from 'win-55-ui-vue';


</script>

<template>
  <Mode7 v-if="breakpoint > 720" />
  <div v-emoji>
    <Window v-if="$route.path !== '/registration'" icon="/icons/pipes.png" faux title="Welcome!" style="margin: 32px">
      <LogoBoxIV :breakpoint="breakpoint" />
    </Window>
  </div>
  <Typography>
    <router-view />
  </Typography>
  <EmojiPickerWindow />
</template>
