<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Typography, Window } from 'win-55-ui-vue'

const visible = ref(false)
const linesVisible = ref(0);


onMounted(() => {
  if (Math.random()<1) {
    setTimeout(() => {
        visible.value = true
      }, 800)
    setTimeout(() => {
        linesVisible.value += 1
      }, 900)
    setTimeout(() => {
        linesVisible.value += 1
      }, 1200)
    setTimeout(() => {
        linesVisible.value += 1
      }, 1500)
    setTimeout(() => {
      linesVisible.value += 1
    }, 1600)
    setTimeout(() => {
      linesVisible.value += 1
    }, 1700)
    setTimeout(() => {
      visible.value = false
    }, 1800)
  }
})
</script>

<template>
  <div v-if="visible" class="cmd-overlay">
    <Window
      title="C:\Windows\system32\cmd.exe"
      :width="800"
      :height="284"
      :extra-styles="{ position: 'relative', left: 'auto', top: 'auto' }"
    >
      <div class="cmd-body">
        <Typography shorthand="Bold12">
          <span v-if="linesVisible > 0">Microslop(R) Windows 55</span><br />
          <span v-if="linesVisible > 0">(c) Корпорация Майкрософт. Все права защищены.</span><br />
          <br />
          <span v-if="linesVisible > 1">C:\Users\User&gt; cd C:\Program Files\OmskMiner</span><br />
          <span v-if="linesVisible > 2">C:\Program Files\OmskMiner&gt; start omsk_miner.exe --silent</span><br />
          <br />
          <br />
          <span v-if="linesVisible > 3">[OK] Подключение к пулу omsk-pool.crypto.gg:322...</span><br />
          <span v-if="linesVisible > 4">[OK] Начинаю майнинг OmskCoin...</span><br>
        </Typography>
      </div>
    </Window>
  </div>
</template>

<style scoped>
.cmd-overlay {
  position: fixed;
  top: 80px;
  left: 68px;
  z-index: 99999;
  pointer-events: none;
}

.cmd-body {
  background: #000;
  color: #ccc;
  padding: 8px;
  overflow: hidden;
}
</style>
