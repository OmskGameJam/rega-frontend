<script setup lang="ts">
import { computed, ref, onMounted, type CSSProperties } from 'vue'
import { Box, typographyStyles } from 'win-55-ui-vue'

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  maxLength?: number
  extraStyles?: CSSProperties
}>(), {
  placeholder: '',
  maxLength: undefined,
  extraStyles: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'enter': []
}>()

const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  inputRef.value?.focus()
})

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

const inputStyle = computed<CSSProperties>(() => ({
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '2px 4px',
  margin: '0',
  ...typographyStyles({ fontColor: 'black' }),
}))
</script>

<template>
  <Box type="textarea" :extra-styles="extraStyles">
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :style="inputStyle"
      @input="handleInput"
      @keydown.enter="emit('enter')"
    />
  </Box>
</template>
