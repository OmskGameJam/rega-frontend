<script setup lang="ts">
import { Box, Typography, Window} from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint';
import Mode7 from './components/Mode7.vue';
import Pipes from './components/Pipes.vue';
const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])

</script>

<template>
  <Mode7 v-if="breakpoint > 720" />
  <div>
    <Window v-if="$route.path !== '/registration'" icon="/icons/pipes.png" faux title="Welcome!" style="margin: 32px">
      <Box type="indent-dark" extra-class="logo-container" :extra-styles="{width: breakpoint}">
        <router-link to="/">
          <img class="logo" :src="breakpoint > 750 ? '/old-long.png' : '/old-short.png'" />
        </router-link>
        <Pipes />
      </Box>
    </Window>
  </div>
  <Typography>
    <router-view />
  </Typography>
</template>

<style scoped lang="css">
  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
</style>