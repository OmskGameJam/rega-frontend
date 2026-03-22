<script setup lang="ts">
import { Box, Typography, Window} from 'win-55-ui-vue'
import { useResponsiveBreakpoint } from './composable/useResponsiveBreakpoint';
import Mode7 from './components/Mode7.vue';
const { breakpoint } = useResponsiveBreakpoint(16, [640, 1000, 1200])

import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let material: THREE.ShaderMaterial;
let animationId: number;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  #define PI 3.14159

  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
      vec2 fragCoord = vUv * uResolution;

      // Plasma calculation
      float time = uTime * 0.01;

      float color1 = (sin(dot(fragCoord.xy, vec2(sin(time*3.0), cos(time*3.0)))*0.02 + time*3.0) + 1.0) / 2.0;
      vec2 center = vec2(uResolution.x/2.0, uResolution.y/2.0) 
                    + vec2(uResolution.x/2.0*sin(-time*3.0), uResolution.y/2.0*cos(-time*3.0));
      float color2 = (cos(length(fragCoord.xy - center)*0.03) + 1.0)/2.0;

      float color = (color1 + color2) / 2.0;

      float red   = (cos(PI*color/0.5 + time*3.0) + 1.0)/2.0;
      float green = (sin(PI*color/0.5 + time*3.0) + 1.0)/2.0;
      float blue  = (sin(time*3.0) + 1.0)/2.0;

      gl_FragColor = vec4(red, green, blue, 1.0);
  }
`;

onMounted(() => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(
    width / -2, width / 2,
    height / 2, height / -2,
    -1, 1
  );
  camera.position.z = 1;

  const geometry = new THREE.PlaneGeometry(width, height);

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) }
    }
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);

  const animate = (time: number) => {
    material.uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    renderer.setSize(w, h);
    camera.left = w / -2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / -2;
    camera.updateProjectionMatrix();

    material.uniforms.uResolution.value.set(w, h);
    mesh.scale.set(w / width, h / height, 1);
  };

  window.addEventListener('resize', onResize);

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  });
});
</script>

<template>
  <Mode7 />
  <div>
    <Window v-if="$route.path !== '/registration'" faux title="Welcome!" style="margin: 32px">
      <Box type="indent-dark" extra-class="logo-container" :extra-styles="{width: breakpoint}">
        <router-link to="/">
          <img class="logo" :src="breakpoint > 750 ? '/old-long.png' : '/old-short.png'" />
        </router-link>
        <canvas ref="canvasRef" style="width: 100%; height: 512px" />
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