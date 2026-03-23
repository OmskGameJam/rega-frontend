<script setup lang="ts">
import { Box, NamedPanel, Typography, Window } from 'win-55-ui-vue'
import { YandexMap, YandexMapDefaultSchemeLayer, YandexMapDefaultFeaturesLayer, YandexMapMarker } from 'vue-yandex-maps'
import IntGrid from '../components/IntGrid.vue';
import { useResponsiveBreakpoint } from '../composable/useResponsiveBreakpoint';
import { computed } from 'vue';
import WeirdText from '../components/WeirdText.vue';
import RegBtn from './RegBtn.vue';
import CmdMiner from '../components/CmdMiner.vue';

const { breakpoint } = useResponsiveBreakpoint(16, [720, 1000, 1200])
const shouldBeCompact = computed(() => {
  return breakpoint.value <= 720
})
</script>
<template>
  <CmdMiner />
  <IntGrid mode="columns" :columns="1" :element-width="breakpoint" align="center">
    <RegBtn />
    <Window icon="/icons/ogd.png" faux title="О программе">
      <IntGrid :gap="16" :columns="1" align="center" :element-width="breakpoint < 840 ? breakpoint - 64 : 840" style="text-align: center;">
        <Typography shorthand="Regular24" element="h1">
          Омский Игровой Хакатон 18&NoBreak;-&NoBreak;19&NoBreak; &NoBreak;апреля&NoBreak;!
        </Typography>
      </IntGrid>
      <Box type="textarea" :extra-styles="{padding: '24px'}">
        <p>
          <Typography shorthand="Bold12">
            Омский Людум Даре
          </Typography> - это <WeirdText text="ЛЕГЕНДАРНЫЙ" /> омский хакатон по разработке ИГР.<br />
          Собираемся 18 апреля в 10:00 в Точке Кипения на Жукова 21 в городе Омске и пишем игру ДВА ДНЯ.
        </p>
        <br>
        <p>
          Стартуем одновременно с мировым <a target="_blank" href="https://ldjam.com/">Ludum Dare #59</a>
          <br />
        </p>
        <br>
        <p>
          Можно участвовать в соло или в команде из 2..5 человек, вживую или удалённо (но лучше вживую!) <a target="_blank" href="https://vk.com/@-41503523-chto-za-ludum-dare-aka-old48">Подробнее о формате мероприятия</a>
          <br><br>
        </p>
        <br>
        <div class="contact">
          <div style="flex-grow: 1;">
            Чат в Телеграме: <a target="_blank" href="https://t.me/omsky_gamedev">t.me/omsky_gamedev</a>
          </div>
          <div float="right">
            Информация дублируется в ВК: <a target="_blank" href="https://vk.com/old48">https://vk.com/old48</a> (<a href="https://vk.me/join/hV7iMiKbpoS3OUQ93fseqhA8btMBUVtEQRA=">чат</a>)
          </div>
        </div>
      </Box>
    </Window>
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 2" :margin-gap="false" :use-offsets="!shouldBeCompact">
      <Window icon="/icons/calendar.png" data-offset-x="-32" data-offset-y="32" title="Суббота, 18 апреля" faux>
        <ul style="margin: 16px;">
          <li>Анонс темы хакатона в чате <a href="https://t.me/omsky_gamedev" target="_blank">https://t.me/omsky_gamedev</a></li>
          <li>Открытие в 10:00</li>
          <li>В 12:00 обсуждение идей игр</li>
          <li>Делаем игры</li>
          <li>Уходим домой в 20:00</li>
        </ul>
      </Window>
      <Window icon="/icons/calendar.png" data-offset-x="32" title="Воскресенье, 19 апреля" faux>
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
    <Window icon="/icons/planet.png" faux title="Геолокация">
      <div style="display: flex; gap: 8px">
        <NamedPanel label="Место">
          <Typography shorthand="Bold12">
            Точка Кипения Омск
          </Typography>
        </NamedPanel>
        <NamedPanel label="Адерс">
          <Typography shorthand="Bold12">
            Омск, ул. Маршала Жукова, 21
          </Typography>
        </NamedPanel>
      </div>
      <Box type="indent" :extra-styles="{margin: '8px'}">
        <YandexMap
          :settings="{ location: { center: [73.387463, 54.985395], zoom: 17 }, behaviors: [ 'drag', 'pinchZoom' ] }"
          style="height: 300px"
        >
          <YandexMapDefaultSchemeLayer />
          <YandexMapDefaultFeaturesLayer />
          <YandexMapMarker :settings="{ coordinates: [73.387091, 54.985378] }">
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
        <li><i>Ш</i>то это - никто не знает, что это; сюда попадают игры, которые <WeirdText text="не такие, как все" canvas-wrapper-style="transform: translateY(-45%) translateX(-25%)" /></li>
      </ul>
    </Box>
    <RegBtn />
    <Window icon="/icons/ogd.png" faux title="Контакты">
      <Box type="textarea" :extra-styles="{padding: '24px'}">
        <div class="contact">
          <div style="flex-grow: 1;">
            Чат в Телеграме: <a target="_blank" href="https://t.me/omsky_gamedev">https://t.me/omsky_gamedev</a>
          </div>
          <div>
            Информация дублируется в ВК: <a target="_blank" href="https://vk.com/old48">https://vk.com/old48</a> (<a target="_blank" href="https://vk.me/join/hV7iMiKbpoS3OUQ93fseqhA8btMBUVtEQRA=">чат</a>)
          </div>
        </div>
      </Box>
    </Window>
  </IntGrid>
</template>


<style>
  .contact {
    display: flex;
  }

  @media (max-width: 720px) {
    .contact {
      flex-direction: column;
      gap: 32px
    }
  }
</style>