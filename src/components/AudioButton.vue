<template>
  <!-- <div style="cursor: pointer;" @click="toggle">
    <span v-if="isLoading">Loading...</span>
    <span v-else-if="isPlaying">Playing</span>
    <span v-else>Paused</span>


  </div> -->
  <Button 
    v-cursor="isLoading ? 'progress' : 'link'"
    :aria-busy="isLoading"
    :aria-pressed="isPlaying"
    :aria-label="isPlaying ? 'Выключить музыку' : 'Включить музыку'"
    :title="isPlaying ? 'Выключить музыку' : 'Включить музыку'"
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
    @waiting="isLoading = true"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, cursorDirective as vCursor } from 'win-55-ui-vue';

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
  isLoading.value = false;
}

function onError() {
  isLoading.value = false;
  isPlaying.value = false;
}

async function toggle() {
  if (!audio.value || (isLoading.value && !isPlaying.value)) return;

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
