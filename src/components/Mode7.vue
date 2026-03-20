<template>
  <div class="mode7-container" :style="containerStyle">
    <!-- DEBUG PANEL -->
    <!-- SCENE -->
    <div
      v-for="layer in layers"
      :key="layer.id"
      class="layer"
      :style="getLayerStyle(layer)"
    />
  </div>
  <Window v-if="showDebug" title="debug" resizable-horizontally resizable-vertically resizable>
    <template #titlebar-buttons>
      <Button 
        extra-class="titlebar-button" 
        base-type="panel-d-2"
        @click="showDebug = false"
      >
        <img draggable="false" src="/node_modules/win-55-ui-vue/public/win-55-ui/window/x.png" />
      </Button>
    </template>
    <div style="width: calc(100% - 2px); height: calc(100% - 40px); overflow: scroll; box-sizing: border-box;">
      <h3>Global</h3>

      <label>Perspective {{ settings.perspective }}</label>
      <input v-model.number="settings.perspective" type="range" min="100" max="2000" />

      <label>Camera RotateZ {{ settings.cameraRotateZ }}</label>
      <input v-model.number="settings.cameraRotateZ" type="range" min="-180" max="180" />

      <label>Global Scale {{ settings.scale }}</label>
      <input v-model.number="settings.scale" type="range" min="0.1" max="3" step="0.1" />

      <hr />

      <div v-for="layer in layers" :key="layer.id" class="layer-controls">
        <h4>{{ layer.id }}</h4>

        <label>SpeedX {{ layer.speedX }}</label>
        <input v-model.number="layer.speedX" type="range" min="-300" max="300" />

        <label>SpeedY {{ layer.speedY }}</label>
        <input v-model.number="layer.speedY" type="range" min="-300" max="300" />

        <label>Z {{ layer.z }}</label>
        <input v-model.number="layer.z" type="range" min="-2000" max="2000" />

        <label>RotateX {{ layer.rotation }}</label>
        <input v-model.number="layer.rotation" type="range" min="0" max="90" />

        <label>RotateZ {{ layer.rotateZ }}</label>
        <input v-model.number="layer.rotateZ" type="range" min="-180" max="180" />

        <label>Scale {{ layer.scale }}</label>
        <input v-model.number="layer.scale" type="range" min="0.1" max="3" step="0.1" />
      </div>
    </div>
  </Window>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from "vue"
import { Button, Window } from "win-55-ui-vue"

type Layer = {
  id: string
  image: string
  width: number
  height: number

  offsetX: number
  offsetY: number

  speedX: number
  speedY: number

  z: number
  rotation: number

  rotateZ: number
  scale: number
}

const showDebug = ref<boolean>(true);

const settings = reactive({
  perspective: 385,
  cameraRotateZ: 0,
  scale: 1
})

const layers = reactive<Layer[]>([
  {
    id: "ground",
    image: "/summer.png",
    width: 1280,
    height: 800,
    offsetX: 0,
    offsetY: 0,
    speedX: 5,
    speedY: 0,
    z: 36,
    rotation: 21,
    rotateZ: -13,
    scale: 1
  },
  {
    id: "clouds-shadow",
    image: "/minecraft-clouds-shadow.png",
    width: 1024,
    height: 1024,
    offsetX: 0,
    offsetY: 0,
    speedX: 10,
    speedY: 0,
    z: 37,
    rotation: 21,
    rotateZ: -13,
    scale: 1
  },
    {
    id: "clouds",
    image: "/minecraft-clouds.png",
    width: 1024,
    height: 1024,
    offsetX: 0,
    offsetY: 0,
    speedX: 10,
    speedY: 0,
    z: 200,
    rotation: 21,
    rotateZ: -13,
    scale: 1
  }
])

function wrap(value: number, size: number): number {
  const half = size / 2

  if (value < -half) return value + size
  if (value > half) return value - size

  return value
}

function updateLayer(layer: Layer, dt: number) {
  layer.offsetX += layer.speedX * dt
  layer.offsetY += layer.speedY * dt

  layer.offsetX = wrap(layer.offsetX, layer.width)
  layer.offsetY = wrap(layer.offsetY, layer.height)
}

function getLayerStyle(layer: Layer) {
  const tx = -layer.offsetX
  const ty = -layer.offsetY

  const cx = -layer.width * 1.5
  const cy = -layer.height * 1.5

  return {
    backgroundImage: `url(${layer.image})`,
    transform: `
      translate(-50%, -50%)
      rotateX(${layer.rotation}deg)
      rotateZ(${layer.rotateZ + settings.cameraRotateZ}deg)
      translateZ(${layer.z}px)
      translateX(${tx}px)
      translateY(${ty}px)
      translate(${cx}px, ${cy}px)
      scale(${layer.scale})
    `
  }
}

const containerStyle = computed(() => ({
  perspective: `${settings.perspective}px`,
  transform: `scale(${settings.scale})`
}))

let last = performance.now()

function loop(now: number) {
  const dt = (now - last) / 1000
  last = now

  for (const layer of layers) {
    updateLayer(layer, dt)
  }

  requestAnimationFrame(loop)
}

onMounted(() => {
  requestAnimationFrame(loop)
})
</script>

<style scoped>
.mode7-container {
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  overflow: hidden;

  transform-style: preserve-3d;
}

/* LAYERS */
.layer {
  position: absolute;

  width: 900%;
  height: 900%;

  top: 50%;
  left: 50%;

  transform-origin: 50% 50%; /* IMPORTANT */
}

/* DEBUG PANEL */
.debug {
  position: absolute;
  top: 10px;
  left: 10px;

  width: 260px;
  max-height: 90vh;
  overflow: auto;

  background: rgba(0, 0, 0, 0.7);
  color: white;

  font-size: 12px;
  padding: 10px;
  border-radius: 8px;
}

.debug input {
  width: 100%;
  margin-bottom: 6px;
}

.layer-controls {
  border-top: 1px solid rgba(255,255,255,0.2);
  margin-top: 8px;
  padding-top: 8px;
}
</style>