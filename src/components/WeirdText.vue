<template>
  <div ref="container" class="weird-text-wrapper">
    <!-- Fallback OR disabled -->
    <div v-if="fallbackActive" class="fallback-text">
      {{ text }}
    </div>

    <!-- Normal mode -->
    <template v-else>
      <!-- Invisible base text for layout -->
      <div ref="textEl" class="base-text">
        {{ text }}
      </div>

      <!-- Three.js mounts here -->
      <div ref="canvasWrapper" class="canvas-wrapper" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { FontLoader, Font, TextGeometry } from "three/examples/jsm/Addons.js";

/* ------------------ Props ------------------ */
const props = defineProps({
  text: { type: String, required: true },
  fontUrl: { type: String, default: "/liberation-facetype.json" },
  fontSize: { type: Number, default: 140 },
  padding: { type: Number, default: 180 },
  canvasWrapperStyle: {
    type: String,
    default: "transform: translateY(-50%) translateX(-25%)",
  },
  fov: { type: Number, default: 20 },
  far: { type: Number, default: 2000 },
  disabled: { type: Boolean, default: false }, // ✅ NEW
});

/* ------------------ Refs ------------------ */
const container = ref<HTMLDivElement | null>(null);
const canvasWrapper = ref<HTMLDivElement | null>(null);
const textEl = ref<HTMLDivElement | null>(null);

const fallbackActive = ref(false); // ✅ NEW

/* ------------------ Three.js state ------------------ */
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let textMesh: THREE.Mesh;
let animationId: number;
let font: Font;

/* ------------------ Init ------------------ */
const initThree = async () => {
  try {
    if (props.disabled) {
      fallbackActive.value = true;
      return;
    }

    if (!canvasWrapper.value || !textEl.value) {
      fallbackActive.value = true;
      return;
    }

    const { width, height } = textEl.value.getBoundingClientRect();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      props.fov,
      width / height,
      0.1,
      props.far
    );
    camera.position.z = props.fontSize * 10;

    const canvasWidth = width + props.padding;
    const canvasHeight = height + props.padding;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(canvasWidth, canvasHeight);

    canvasWrapper.value.appendChild(renderer.domElement);
    canvasWrapper.value.style.cssText = props.canvasWrapperStyle;

    const loader = new FontLoader();
    font = await new Promise((resolve, reject) => {
      loader.load(props.fontUrl, resolve, undefined, reject);
    });

    const geometry = new TextGeometry(props.text, {
      font,
      size: props.fontSize,
      curveSegments: 12,
      bevelEnabled: false,
    });

    geometry.computeBoundingBox();

    const textWidth =
      geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    const textHeight =
      geometry.boundingBox!.max.y - geometry.boundingBox!.min.y;

    geometry.translate(-textWidth / 2, -textHeight / 2, 0);

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    textMesh = new THREE.Mesh(geometry, material);
    scene.add(textMesh);

    animate();
  } catch (err) {
    console.error("Three.js init failed:", err);
    fallbackActive.value = true; // ✅ fallback on ANY failure
  }
};

/* ------------------ Animation ------------------ */
let hue = 0;

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (textMesh) {
    textMesh.scale.y = 0.45;
    textMesh.rotation.y += 0.03;

    hue = (hue + 1) % 360;
    (textMesh.material as THREE.MeshBasicMaterial).color.setHSL(
      hue / 360,
      1,
      0.2
    );
  }

  renderer.render(scene, camera);
};

/* ------------------ Lifecycle ------------------ */
onMounted(() => {
  nextTick(initThree);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  renderer?.dispose();
  textMesh?.geometry?.dispose();
  (textMesh?.material as THREE.Material)?.dispose();
});

/* ------------------ Watch ------------------ */
watch(
  () => props.text,
  () => {
    if (!textMesh || !font || fallbackActive.value) return;

    const newGeom = new TextGeometry(props.text, {
      font,
      size: props.fontSize,
      curveSegments: 12,
      bevelEnabled: false,
    });

    newGeom.computeBoundingBox();

    const centerOffsetX =
      -0.5 * (newGeom.boundingBox!.max.x - newGeom.boundingBox!.min.x);
    const centerOffsetY =
      -0.5 * (newGeom.boundingBox!.max.y - newGeom.boundingBox!.min.y);

    newGeom.translate(centerOffsetX, centerOffsetY, 0);

    textMesh.geometry.dispose();
    textMesh.geometry = newGeom;
  }
);
</script>

<style scoped>
.weird-text-wrapper {
  display: inline-block;
  position: relative;
}

.base-text {
  visibility: hidden;
  white-space: pre;
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* ✅ fallback styling (kept minimal, same layout intent) */
.fallback-text {
  white-space: pre;
}
</style>