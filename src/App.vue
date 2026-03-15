<script setup lang="ts">
import { Box, Button } from 'win-55-ui-vue'
import StringCycler from './components/StringCycler.vue'
</script>

<template>
  <main>
    <!-- TODO: Snowfall - нет аналога в win-55-ui-vue, нужна Vue-библиотека или своя реализация -->

    <section>
      <div class="section-center">
        <router-link to="/">
          <img class="logo" src="/jar.png" />
        </router-link>
      </div>
    </section>

    <section>
      <h1 class="text-outline d-box">
        Омский Игровой Хакатон 5-6 января!
      </h1>
      <Box type="panel-d-1">
        <p>
          <b><span>Игровое Варенье №5</span></b> - это омский хакатон по разработке ИГР.<br />
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
    </section>

    <section>
      <div class="section-center">
        <router-link v-slot="{ navigate }" to="/register" custom>
          <Button @click="navigate">
            Регистрация команды
          </Button>
        </router-link>
      </div>
    </section>

    <section>
      <div class="ras">
        <Box type="panel-d-1" :extra-styles="{ gridArea: '1 / 1 / 2 / 2' }">
          <h4>Понедельник 5 января:</h4>
          <ul>
            <li>Анонс темы хакатона в чате <a href="https://t.me/omsky_gamedev" target="_blank">https://t.me/omsky_gamedev</a></li>
            <li>Открытие в 10:00</li>
            <li>В 12:00 обсуждение идей игр</li>
            <li>Делаем игры</li>
            <li>Уходим домой в 20:00</li>
          </ul>
        </Box>
        <Box type="panel-d-1" :extra-styles="{ gridArea: '1 / 2 / 2 / 3' }">
          <h4>Вторник 6 января:</h4>
          <ul>
            <li>Открытие в 10:00</li>
            <li>Делаем игры</li>
            <li>Ярмарка игр в 18:00 <b>(Можно звать друзей!)</b></li>
            <li>Подведение итогов, награжения и СЮРПРИЗ</li>
            <li>Афтепати в Биркиндоме в 21:00</li>
          </ul>
        </Box>
        <Box type="panel-d-1" :extra-styles="{ gridArea: '2 / 1 / 3 / 3' }">
          <div>
            <div>Место: <b>ИТ-парк Омск</b></div>
            <div>Адрес: Омск, пр. Комарова, 21 к1</div>
            <br /><br />
          </div>
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
        <Box type="panel-d-1" :extra-styles="{ gridArea: '3 / 1 / 3 / 3' }">
          В конце второго дня происходит Ярмарка Игр, на которой участники голосуют за игры друг друга в следующих номинациях:
          <ul>
            <li>Геймплей - игра, в которую веселее или интереснее всего играть</li>
            <li>Красота - игра с лучшим артом, лучшими шейдерами или попросту тесно сшитая</li>
            <li>Звук - игра с лучшим звуковым оформлением, короче, Dolbit Normalno</li>
            <li><i>Ш</i>то это - никто не знает, что это; сюда попадают игры, которые <span style="font-family: cursive">не такие, как все</span></li>
          </ul>
        </Box>
      </div>
    </section>

    <router-view />
  </main>
</template>
