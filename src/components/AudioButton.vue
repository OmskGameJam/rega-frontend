<template>
  <!-- <div style="cursor: pointer;" @click="toggle">
    <span v-if="isLoading">Loading...</span>
    <span v-else-if="isPlaying">Playing</span>
    <span v-else>Paused</span>


  </div> -->
  <Button 
    extra-class="titlebar-button" 
    base-type="panel-d-2"
    @click="toggle"
  >
    <img draggable="false" :src="isLoading ? 'loading.png' : isPlaying ? 'unaudio.png' : 'audio.png'" />
  </Button>
  <audio
    ref="audio"
    :src="src"
    loop
    style="display: none"
    @canplay="onCanPlay"
    @playing="onPlaying"
    @pause="onPause"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'win-55-ui-vue';

defineProps<{
  src: string;
}>();

const audio = ref<HTMLAudioElement | null>(null);

const isLoading = ref(false);
const isPlaying = ref(false);

function onCanPlay() {
  isLoading.value = false;
}

function onPlaying() {
  isPlaying.value = true;
  isLoading.value = false;
}

function onPause() {
  isPlaying.value = false;
}

async function toggle() {
  if (!audio.value) return;

  if (isPlaying.value) {
    audio.value.pause();
  } else {
    isLoading.value = true;
    try {
      await audio.value.play();
    } catch {
      isLoading.value = false;
    }
  }
}
</script>