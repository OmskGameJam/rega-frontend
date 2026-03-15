<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  strings: string[]
  displayDuration?: number
  transformationInterval?: number
  lengthAdjustmentInterval?: number
}>(), {
  displayDuration: 3000,
  transformationInterval: 10,
  lengthAdjustmentInterval: 50,
})

const currentString = ref(props.strings[0] || '')
const isTransforming = ref(false)

let currentIndex = 0
let transformIntervalId: number | undefined
let lengthIntervalId: number | undefined
let displayTimeoutId: number | undefined

function getRandomChar(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '
  return chars[Math.floor(Math.random() * chars.length)]
}

function transformCharacter(currentChar: string, goalChar: string): string {
  if (currentChar === goalChar) return currentChar
  const currentCode = currentChar.charCodeAt(0)
  const goalCode = goalChar.charCodeAt(0)
  return String.fromCharCode(currentCode < goalCode ? currentCode + 1 : currentCode - 1)
}

function startTransformation(from: string, to: string) {
  if (transformIntervalId) clearInterval(transformIntervalId)
  if (lengthIntervalId) clearInterval(lengthIntervalId)

  isTransforming.value = true
  let current = from

  const lengthStep = () => {
    if (current.length < to.length) {
      current += getRandomChar()
      currentString.value = current
    } else if (current.length > to.length) {
      const removeIndex = Math.floor(Math.random() * current.length)
      current = current.slice(0, removeIndex) + current.slice(removeIndex + 1)
      currentString.value = current
    }
    if (current.length === to.length && lengthIntervalId) {
      clearInterval(lengthIntervalId)
      lengthIntervalId = undefined
    }
  }

  const transformationStep = () => {
    const chars = current.split('')
    let changed = false

    const mismatchedIndices: number[] = []
    for (let i = 0; i < Math.min(chars.length, to.length); i++) {
      if (chars[i] !== to[i]) mismatchedIndices.push(i)
    }
    if (chars.length > to.length) {
      for (let i = to.length; i < chars.length; i++) mismatchedIndices.push(i)
    }

    if (mismatchedIndices.length > 0) {
      const randomIndex = mismatchedIndices[Math.floor(Math.random() * mismatchedIndices.length)]
      if (randomIndex < to.length) {
        chars[randomIndex] = transformCharacter(chars[randomIndex], to[randomIndex])
        current = chars.join('')
        currentString.value = current
        changed = true
      }
    }

    if (!changed && current !== to && chars.length > 0) {
      const validIndices = Array.from({ length: Math.min(chars.length, to.length) }, (_, i) => i)
      if (validIndices.length > 0) {
        const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)]
        chars[randomIndex] = transformCharacter(chars[randomIndex], to[randomIndex])
        current = chars.join('')
        currentString.value = current
      }
    }

    if (current === to) {
      if (transformIntervalId) { clearInterval(transformIntervalId); transformIntervalId = undefined }
      if (lengthIntervalId) { clearInterval(lengthIntervalId); lengthIntervalId = undefined }
      isTransforming.value = false

      displayTimeoutId = window.setTimeout(() => {
        const nextIndex = (currentIndex + 1) % props.strings.length
        const nextString = props.strings[nextIndex]
        currentIndex = nextIndex
        startTransformation(to, nextString)
      }, props.displayDuration)
    }
  }

  lengthIntervalId = window.setInterval(lengthStep, props.lengthAdjustmentInterval)
  transformIntervalId = window.setInterval(transformationStep, props.transformationInterval)
}

onMounted(() => {
  if (props.strings.length === 0) return

  const firstString = props.strings[0]
  currentString.value = firstString
  currentIndex = 0

  displayTimeoutId = window.setTimeout(() => {
    const secondString = props.strings[1] || props.strings[0]
    startTransformation(firstString, secondString)
    currentIndex = 1
  }, props.displayDuration)
})

onUnmounted(() => {
  if (displayTimeoutId) clearTimeout(displayTimeoutId)
  if (transformIntervalId) clearInterval(transformIntervalId)
  if (lengthIntervalId) clearInterval(lengthIntervalId)
})
</script>

<template>
  <span>
    {{ currentString }}
    <span v-if="isTransforming" style="animation: blink 1s infinite" />
  </span>
</template>
