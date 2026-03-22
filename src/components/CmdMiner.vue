<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Typography, Window } from 'win-55-ui-vue'

const visible = ref(false)

onMounted(() => {
  if (Math.random()<0.1) {
    setTimeout(() => {
        visible.value = true
      }, 800)
    setTimeout(() => {
      visible.value = false
    }, 1700)
  }
})
</script>

<template>
  <div v-if="visible" class="cmd-overlay">
    <Window
      title="C:\Windows\system32\cmd.exe"
      :width="800"
      :height="280"
      :extra-styles="{ position: 'relative', left: 'auto', top: 'auto' }"
    >
      <div class="cmd-body">
        <Typography shorthand="Bold12">
          Microslop(R) Windows 55<br />
          (c) Корпорация Майкрософт. Все права защищены.<br />
          <br />
          C:\Users\User&gt; cd C:\Program Files\OmskMiner<br />
          C:\Program Files\OmskMiner&gt; start omsk_miner.exe --silent<br />
          <br />
          <br />
          [OK] Подключение к пулу omsk-pool.crypto.gg:322...<br />
          [OK] Начинаю майнинг OmskCoin...
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
