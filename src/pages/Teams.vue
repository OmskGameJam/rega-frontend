<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Box } from 'win-55-ui-vue'
import { globalAxios } from '../net/axios'
import { YM_COUNTER } from '../helpers/constants'

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

onMounted(() => {
  ym(YM_COUNTER, 'reachGoal', 'view-teams')

  globalAxios.get('/rega')
    .then((d) => {
      teams.value = d.data
      loading.value = false
      activeTeam.value = parseInt(window.localStorage.getItem('my-team') ?? '') || 0
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

  <div v-else class="team-masonry">
    <Box
      v-for="t in teams"
      :key="t.id"
      type="panel-d-2"
      :extra-class="'d-box-black' + (activeTeam === t.id ? ' active' : '')"
    >
      <div><b>Название: </b> {{ t.name }}</div>
      <br />
      <div><b>Опыт: </b> {{ t.exp }}</div>
      <div><b>Класс: </b> {{ t.tech }}</div>
      <div><b>Контакты: </b> {{ t.contact }}</div>
      <div><b>Где хакатонит:</b> {{ t.where }}</div>
      <br />
      <div><b>Участники: </b> {{ t.members }}</div>
      <br />
      <div><b>Как готовится:</b> {{ t.prepare }}</div>
      <div><b>Полезный совет:</b> {{ t.advice }}</div>
    </Box>
  </div>
</template>
