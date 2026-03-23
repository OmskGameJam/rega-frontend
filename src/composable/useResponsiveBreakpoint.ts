import { ref, computed, onMounted, onUnmounted } from "vue";

type Breakpoints = number[];

export function useResponsiveBreakpoint(
  gutter: number,
  landscape: Breakpoints,
  portrait?: Breakpoints
) {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const handleResize = () => {
    width.value = document.body.getBoundingClientRect().width;
    height.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  const isPortrait = computed(() => height.value > width.value);

  const activeBreakpoints = computed(() => {
    return isPortrait.value
      ? (portrait ?? landscape)
      : landscape;
  });

  const value = computed(() => {
    const bp = [...activeBreakpoints.value].sort((a, b) => a - b);

    // Find largest breakpoint <= width
    for (let i = bp.length - 1; i >= 0; i--) {
      if (width.value >= bp[i]) {
        return bp[i] - gutter;
      }
    }

    // Fallback: width smaller than smallest breakpoint
    return Math.floor(width.value) - gutter;
  });

  return {
    width,
    height,
    isPortrait,
    breakpoint: value,
  };
}