<script setup lang="ts">
import { onMounted, ref, type CSSProperties } from 'vue'
import { BaseInput } from 'win-55-ui-vue'

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
    :max-length="maxLength"
    :extra-styles="extraStyles"
    show-emoji-button
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.enter="emit('enter')"
  />
</template>
