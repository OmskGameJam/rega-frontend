<script setup lang="ts">
import { computed, ref, onMounted, type CSSProperties } from 'vue'
import { Box, typographyStyles } from 'win-55-ui-vue'

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  rows?: number
  extraStyles?: CSSProperties
}>(), {
  placeholder: '',
  disabled: false,
  maxLength: undefined,
  rows: 5,
  extraStyles: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()

onMounted(() => {
  setTimeout(() => {
    textareaRef.value?.focus()
  }, 0)
})

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

const textareaStyle = computed<CSSProperties>(() => ({
  width: '100%',
  boxSizing: 'border-box',
  resize: 'none',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '0',
  margin: '0',
  ...typographyStyles({ fontColor: 'black' }),
}))
</script>

<template>
  <Box type="textarea" :extra-styles="extraStyles">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      :rows="rows"
      :style="textareaStyle"
      @input="handleInput"
    />
  </Box>
</template>
