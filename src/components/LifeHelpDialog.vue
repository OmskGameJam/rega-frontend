<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Button, Typography, Window, cursorDirective as vCursor } from 'win-55-ui-vue'

const helpWindow = ref<InstanceType<typeof Window> | null>(null)
const isOpen = ref(false)
const windowX = ref(0)
const windowY = ref(12)
const windowWidth = ref(460)

async function open() {
  if (isOpen.value) return

  windowWidth.value = Math.max(1, Math.min(460, window.innerWidth - 24))
  windowX.value = Math.max(0, (window.innerWidth - windowWidth.value) / 2)
  windowY.value = 12
  isOpen.value = true
  await nextTick()
  const height = helpWindow.value?.$el.getBoundingClientRect().height ?? 0
  windowY.value = Math.max(12, (window.innerHeight - height) / 2)
}

function close() {
  isOpen.value = false
}

defineExpose({ open })
</script>

<template>
  <Window
    v-if="isOpen"
    ref="helpWindow"
    v-model:x="windowX"
    v-model:y="windowY"
    :width="windowWidth"
    title="About OgdLifeSand"
    icon="/logo-sand.png"
    :extra-styles="{ position: 'fixed', height: 'auto', zIndex: 2147483647 }"
  >
    <template #titlebar-buttons>
      <Button
        v-cursor="'link'"
        extra-class="titlebar-button"
        base-type="panel-d-2"
        aria-label="Close"
        title="Close"
        @click="close"
      >
        <img draggable="false" :src="'/win-55-ui/window/x.png'" alt="" />
      </Button>
    </template>
    <Typography>
      <div class="life-help-content">
        <div class="life-help-about">
          <img class="life-help-icon" draggable="false" src="/logo-sand.png" alt="" />
          <div>
            <h1>
              OgdLifeSand
            </h1>
            <p>© 2026 Omsky Gamedev</p>
          </div>
        </div>
        <hr />
        <p>Left click and drag to draw sand.</p>
        <p>Right click and drag to draw life.</p>
        <p>Use the play/pause button to stop or resume the simulation.</p>
        <div class="life-help-actions">
          <Button
            v-cursor="'link'"
            :extra-styles="{ minWidth: '100px', textAlign: 'center' }"
            @click="close"
          >
            OK
          </Button>
        </div>
      </div>
    </Typography>
  </Window>
</template>

<style scoped>
.life-help-content {
  padding: 16px;
}

.life-help-about {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.life-help-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.life-help-content h1 {
  margin: 0 0 8px;
  font-family: Standard-Bold-12;
  font-size: 24px;
}

.life-help-content p {
  margin: 0 0 8px;
}

.life-help-content hr {
  margin: 16px 0;
  border: 0;
  border-top: 2px solid #888;
  border-bottom: 2px solid white;
}

.life-help-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
