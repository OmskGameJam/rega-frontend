<script setup lang="ts">
import { Box, Button, NamedPanel, Typography, Window } from 'win-55-ui-vue'
import { YandexMap, YandexMapDefaultSchemeLayer, YandexMapDefaultFeaturesLayer, YandexMapMarker } from 'vue-yandex-maps'
import StringCycler from '../components/StringCycler.vue';
import IntGrid from '../components/IntGrid.vue';
import { useResponsiveBreakpoint } from '../composable/useResponsiveBreakpoint';
import { computed } from 'vue';

const { breakpoint } = useResponsiveBreakpoint(16, [720, 1000, 1200])
const shouldBeCompact = computed(() => {
  return breakpoint.value <= 720
})
</script>

<template>
  <IntGrid mode="columns" :columns="1" :element-width="breakpoint" align="center">
    <Window faux title="О программе">
      <IntGrid :gap="16" :columns="1" align="center" :element-width="breakpoint < 840 ? breakpoint - 64 : 840" style="text-align: center;">
        <Typography shorthand="Regular24" element="h1">
          Омский Игровой Хакатон 18&NoBreak;-&NoBreak;19&NoBreak; &NoBreak;апреля&NoBreak;!
        </Typography>
      </IntGrid>
      {{ breakpoint+16 }}
      <Box type="textarea" :extra-styles="{padding: '24px'}">
        <p>
          <Typography shorthand="Bold12">
            Игровое Варенье №5
          </Typography> - это омский хакатон по разработке ИГР.<br />
          Собираемся 5 января в 10:00 в ИТ-парке на Комарова 21 к1 в городе Омске и пишем игру ДВА ДНЯ.
        </p>
        <p>
          Стартуем одновременно с <a target="_blank" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ">
            <StringCycler :strings="[
              'undefined', '[object Object]', 'ERROR', 'ReferenceError',
              'NullPointerException', 'NaN', 'DivisionByZeroException',
              '[screaming externally]', 'VibeCheckNotPassedException',
              'Abort, Retry, Ignore, Fail?', '?REDO FROM START',
              'lp0 on fire', 'Guru Meditation'
            ]" />
          </a>...?
          <br />
        </p>
        <p>
          В этот раз мы не синхронизируемся с каким-то мировым джемом! Тему подберём сами и анонсируем в день начала.
        </p>
        <p>
          Можно участвовать в соло или в команде из 2..5 человек.
        </p>
      </Box>
    </Window>
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 2" :margin-gap="false">
      <Window title="Суббота, 18 апреля" faux>
        <ul style="margin: 16px;">
          <li>Анонс темы хакатона в чате <a href="https://t.me/omsky_gamedev" target="_blank">https://t.me/omsky_gamedev</a></li>
          <li>Открытие в 10:00</li>
          <li>В 12:00 обсуждение идей игр</li>
          <li>Делаем игры</li>
          <li>Уходим домой в 20:00</li>
        </ul>
      </Window>
      <Window title="Воскресенье, 19 апреля" faux>
        <ul style="margin: 16px;">
          <li>Открытие в 10:00</li>
          <li>Делаем игры</li>
          <li>
            Ярмарка игр в 18:00 <Typography shorthand="Bold12">
              (Можно звать друзей!)
            </Typography>
          </li>
          <li>Подведение итогов, награжения и СЮРПРИЗ</li>
          <li>Афтепати в Биркиндоме в 21:00</li>
        </ul>
      </Window>
    </IntGrid>
    <Window faux title="Геолокация">
      <div style="display: flex; gap: 8px">
        <NamedPanel label="Место">
          <Typography shorthand="Bold12">
            ИТ-парк Омск
          </Typography>
        </NamedPanel>
        <NamedPanel label="Адерс">
          <Typography shorthand="Bold12">
            Омск, пр. Комарова, 21 к1
          </Typography>
        </NamedPanel>
      </div>
      <Box type="indent" :extra-styles="{margin: '8px'}">
        <YandexMap
          :settings="{ location: { center: [73.309408, 54.983200], zoom: 17 } }"
          style="height: 300px"
        >
          <YandexMapDefaultSchemeLayer />
          <YandexMapDefaultFeaturesLayer />
          <YandexMapMarker :settings="{ coordinates: [73.310165, 54.983346] }">
            <div style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap;">
              Вход туташки!
            </div>
          </YandexMapMarker>
        </YandexMap>
      </Box>
    </Window>
    <Box type="notification">
      В конце второго дня происходит Ярмарка Игр, на которой участники голосуют за игры друг друга в следующих номинациях:
      <ul>
        <li>Геймплей - игра, в которую веселее или интереснее всего играть</li>
        <li>Красота - игра с лучшим артом, лучшими шейдерами или попросту тесно сшитая</li>
        <li>Звук - игра с лучшим звуковым оформлением, короче, Dolbit Normalno</li>
        <li><i>Ш</i>то это - никто не знает, что это; сюда попадают игры, которые <span style="font-family: cursive">не такие, как все</span></li>
      </ul>
    </Box>
    <router-link v-slot="{ navigate }" to="/registration" custom>
      <Button @click="navigate">
        Регистрация команды
      </Button>
    </router-link>
  </IntGrid>
</template>
