<script setup lang="ts">
import { Button, Typography } from 'win-55-ui-vue';
import IntGrid from '../components/IntGrid.vue';

</script>

<template>
  <router-link v-slot="{ navigate }" to="/registration" custom>
    <IntGrid align="center" mode="columns" :element-width="350" :columns="1">
      <Button :extra-styles="{width: '350px'}" @click="navigate">
        <img src="/public/icon-register.png" />
        <span style="position: relative; top: -14px; left: 10px"><Typography font-color="#FFFFFF" font-shadow-color="#000000" shorthand="Bold12">Регистрация команды</Typography></span>
      </Button>
    </IntGrid>
  </router-link>
</template>