<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Box, Typography, Window } from 'win-55-ui-vue'
import { globalAxios } from '../net/axios'
import { YM_COUNTER } from '../helpers/constants'
import IntGrid from '../components/IntGrid.vue'

interface ITeamData {
  id: number
  name: string
  exp: string
  contact: string
  where: string
  category: string
  members: string
  advice: string
  prepare: string
  tech: string
}

const loading = ref(true)
const teams = ref<ITeamData[]>([])
const activeTeam = ref(0)
const animate = ref(false)

const N = 700 // animation duration
const M = 150 // delay step

onMounted(() => {
  ym(YM_COUNTER, 'reachGoal', 'view-teams')

  globalAxios.get('/rega')
    .then((d) => {
      teams.value = d.data
      loading.value = false
      activeTeam.value = parseInt(window.localStorage.getItem('my-team') ?? '') || 0

      requestAnimationFrame(() => {
        animate.value = true
      })
    })
    .catch(() => {
      alert('Не удалось загрузить команды :(')
    })
})
</script>

<template>
  <Box v-if="loading" type="panel-d-2" extra-class="d-box-black">
    Загружаем команды...
  </Box>

  <IntGrid v-else
           mode="auto-column"
           :element-width="512"
           align="center"
  >
    <Window
      v-for="(t, idx) in teams"
      :key="t.id"
      faux
      class="team-window"
      :class="{ 'animate-in': animate }"
      :style="{
        animationDuration: N + 'ms',
        animationDelay: (idx * M) + 'ms'
      }"
      :type="(activeTeam === t.id ? 'notification' : 'panel-d-2')"
      :title="`№ ${idx + 1} ${t.name}`"
    >
      <div style="padding: 6px">
        <div>
          <Typography shorthand="Bold12">
            Название:
          </Typography> {{ t.name }}
        </div>
        <br />
        <div>
          <Typography shorthand="Bold12">
            Опыт:
          </Typography> {{ t.exp }}
        </div>
        <div>
          <Typography shorthand="Bold12">
            Класс:
          </Typography> {{ t.tech }}
        </div>
        <div>
          <Typography shorthand="Bold12">
            Контакты:
          </Typography> {{ t.contact }}
        </div>
        <div>
          <Typography shorthand="Bold12">
            Где хакатонит:
          </Typography> {{ t.where }}
        </div>
        <br />
        <div>
          <Typography shorthand="Bold12">
            Участники:
          </Typography> {{ t.members }}
        </div>
        <br />
        <div>
          <Typography shorthand="Bold12">
            Как готовится:
          </Typography> {{ t.prepare }}
        </div>
        <div>
          <Typography shorthand="Bold12">
            Полезный совет:
          </Typography> {{ t.advice }}
        </div>
      </div>
    </Window>
  </IntGrid>
</template>

<style scoped>
.team-window {
  opacity: 0;
  transform: translateY(0px);
}

.animate-in {
  animation-name: flyIn;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes flyIn {
  from {
    opacity: 0;
    transform: down, translateY(-480px)
  }

  to {
    opacity: 1;
  }
}
</style>