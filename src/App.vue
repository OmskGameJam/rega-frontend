<script setup lang="ts">
import { Box, Typography, Window} from 'win-55-ui-vue'

</script>

<template>
  <Window faux title="Welcome!" style="width: fit-content; margin: 32px auto">
    <Box type="indent-dark" extra-class="logo-container">
      <router-link to="/">
        <img class="logo" src="/old-long.png" />
        <img class="logo-mobile" src="/old-short.png" />
      </router-link>
      <canvas style="width: 100%; height: 100%" />
    </Box>
  </Window>
  <Typography>
    <router-view />
  </Typography>
</template>
