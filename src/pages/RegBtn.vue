<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Balloon, Button, Typography } from 'win-55-ui-vue';
import IntGrid from '../components/IntGrid.vue';
import { computed } from 'vue';
import { EVENT_NOW } from '../constants';

const c = computed(() => {
  if (window.innerWidth < 1000) {
    return {
      side: 'bottom' as any,
      bias: 'right' as any
    }
  } else {
    return {
      side: 'right' as any,
      bias: 'up' as any
    }
  }
})


const balloonEnabled = computed(() => {
  return window.localStorage.getItem('edition') == EVENT_NOW
})

</script>

<template>
  <router-link v-slot="{ navigate }" to="/registration" custom>
    <IntGrid align="center" mode="columns" :element-width="350" :columns="1">
      <Balloon :shown="balloonEnabled" :side="c.side" :bias="c.bias">
        <template #content>
          Вы уже зарегистрированы!<br />
          <router-link to="/teams">
            Посмотреть команды
          </router-link>
        </template>
        <Button :extra-styles="{width: '350px'}" @click="navigate">
          <img src="/public/icon-register.png" />
          <span style="position: relative; top: -14px; left: 10px"><Typography font-color="#FFFFFF" font-shadow-color="#000000" shorthand="Bold12">Регистрация команды</Typography></span>
        </Button>
      </Balloon>
    </IntGrid>
  </router-link>
</template>