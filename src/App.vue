<script setup lang="ts">
import { Button, Typography, Window } from 'win-55-ui-vue'
import { customEmojiDirective as vEmoji, EmojiPickerWindow } from 'win-55-ui-vue'
import { ref } from 'vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint';
import Mode7 from './components/Mode7.vue';
import LogoBoxOLD from './components/LogoBoxOLD.vue';
const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])
// Change this value to choose which screensaver is built into the banner.
const screensaver: 'pipes' | 'life' = 'life'
const paused = ref(false)


</script>

<template>
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
</template>
