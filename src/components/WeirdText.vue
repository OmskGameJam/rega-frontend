<template>
  <div ref="container" class="weird-text-wrapper">
    <!-- Invisible base text for layout & font matching -->
    <div ref="textEl" class="base-text">
      {{ text }}
    </div>
    <!-- Three.js will mount its canvas here -->
    <div ref="canvasWrapper" class="canvas-wrapper" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, nextTick, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/Addons.js"; 
import { TextGeometry } from "three/examples/jsm/Addons.js";

export default defineComponent({
  name: "WeirdText",
  props: {
    text: { type: String, required: true },
    fontUrl: { type: String, default: "/liberation-facetype.json" }, // JSON font for three.js (typeface.json)
    fontSize: { type: Number, default: 140 },
    padding: { type: Number, default: 180 }, // extra space so spinning text doesn't clip,
    canvasWrapperStyle: {type: String, default: "transform: translateY(-50%) translateX(-25%)"},
    fov: {type: Number, default: 20},
    far: {type: Number, default: 2000}
  },
  setup(props) {
    const container = ref<HTMLDivElement>();
    const canvasWrapper = ref<HTMLDivElement>();
    const textEl = ref<HTMLDivElement>();

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let textMesh: THREE.Mesh;
    let animationId: number;
    let font: Font;

    const initThree = async () => {
      if (!canvasWrapper.value || !textEl.value) return;

      // Get dimensions from base text
      const { width, height } = textEl.value.getBoundingClientRect();

      // Scene & camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(props.fov, width / height, 0.1, props.far);
      camera.position.z = props.fontSize*10;

      const canvasWidth = width + props.padding;
      const canvasHeight = height + props.padding;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setSize(canvasWidth, canvasHeight);
      canvasWrapper.value.appendChild(renderer.domElement);
      canvasWrapper.value.style.cssText = props.canvasWrapperStyle
      // Load font
      const loader = new FontLoader();
      font = await new Promise((resolve, reject) => {
        loader.load(
          props.fontUrl,
          (f) => resolve(f),
          undefined,
          (err) => reject(err)
        );
      });

      // Text geometry
      const geometry = new TextGeometry(props.text, {
        font: font,
        size: props.fontSize,
        curveSegments: 12,
        bevelEnabled: false,
      });

      // Center geometry
      geometry.computeBoundingBox();
      const textWidth = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
      const textHeight = geometry.boundingBox!.max.y - geometry.boundingBox!.min.y;
      geometry.translate(
        -textWidth / 2, // center X + half padding
        -textHeight / 2, // center Y + half padding
        0
      );

      // Material
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      textMesh = new THREE.Mesh(geometry, material);
      scene.add(textMesh);

      animate();
    };

    let hue = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (textMesh) {
        textMesh.scale.y = 0.45
        textMesh.rotation.y = textMesh.rotation.y + 0.03; // spin
        hue = (hue + 1) % 360;
        (textMesh.material as THREE.MeshBasicMaterial).color.setHSL(hue / 360, 1, 0.2);
      }

      renderer.render(scene, camera);
    };

    onMounted(() => {
      nextTick(() => {
        initThree();
      });
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      textMesh.geometry.dispose();
      (textMesh.material as THREE.Material).dispose();
    });

    // Watch text changes
    watch(() => props.text, () => {
      if (textMesh && font) {
        const newGeom = new TextGeometry(props.text, {
          font: font,
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
    });

    return { container, canvasWrapper, textEl };
  },
});
</script>

<style scoped>
.weird-text-wrapper {
  display: inline-block;
  position: relative;
}

.base-text {
  visibility: hidden; /* takes space but invisible */
  white-space: pre;
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
}
</style>