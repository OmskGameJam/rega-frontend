<script setup lang="ts">
import { onMounted, ref, type CSSProperties } from 'vue'
import { BaseInput } from 'win-55-ui-vue'

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  extraStyles?: CSSProperties
}>(), {
  placeholder: '',
  disabled: false,
  maxLength: undefined,
  extraStyles: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<InstanceType<typeof BaseInput>>()

onMounted(() => {
  inputRef.value?.el?.focus()
})
</script>

<template>
  <BaseInput
    ref="inputRef"
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :max-length="maxLength"
    :extra-styles="{ width: '100%', boxSizing: 'border-box', ...extraStyles }"
    multiline
    show-emoji-button
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
