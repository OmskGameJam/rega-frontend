<script setup lang="ts">
import { Box, Typography, Window } from 'win-55-ui-vue'
import IntGrid from '../components/IntGrid.vue'
import { useResponsiveBreakpoint } from '../composable/useResponsiveBreakpoint'
import { computed } from 'vue'
import WeirdText from '../components/WeirdText.vue'
import ScrollIndicator from '../components/ScrollIndicator.vue'

const { breakpoint } = useResponsiveBreakpoint(16, [720, 1000, 1200])
const shouldBeCompact = computed(() => breakpoint.value <= 720)

function imgSrc(n: number) {
  return `/article/images/image_${String(n).padStart(2, '0')}.jpg`
}

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}
</script>

<template>
  <IntGrid mode="columns" :columns="1" :element-width="breakpoint" align="center">

    <!-- Заголовок -->
    <Window icon="/icons/ogd.png" faux title="Что за Людум Даре a.k.a OLD48?">
      <div class="about-title">
        <Typography shorthand="Regular24" element="h1">
          Что за <WeirdText text="Людум Даре" /> a.k.a OLD48?
        </Typography>
      </div>
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <p>
          <Typography shorthand="Bold12">Омский Людум Даре №59 | 10 апр 2024</Typography>
        </p>
        <br />
        <Box type="indent-dark" :extra-styles="{ padding: '0' }">
          <img class="about-img" loading="lazy" src="/article/images/image_01.jpg" alt="Людум Даре" />
        </Box>
        <br />
        <p>
          Людум Даре - мировой конкурс по созданию игр за 48 часов. 3 раза в год разработчики, дизайнеры и просто весёлые ребята со всего мира создают новые игры на тему, выбранную общим голосованием. Вот сайт <a target="_blank" href="https://ldjam.com/">https://ldjam.com/</a>.
        </p>
        <br />
        <p>
          Мы в Омске собираемся вместе в выходные в коворкинге и проводим свой Омский Людум Даре (OLD48). Потом можно выложить игру на мировом людуме, чтобы участвовать в общем соревновании.
        </p>
        <br />
        <p>
          Омский Людум даре - это фестиваль геймдева; праздник, на котором собираются творческие ребята: программисты, художники, музыканты, сценаристы, да кто угодно, и самовыражаются через создание игр. Мы создаем вдохновляющую и конструктивную среду, где участники делятся своими навыками, идеями и получают обратную связь от других участников.
        </p>
      </Box>
    </Window>

    <!-- Фото-галерея 1 -->
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 2" :margin-gap="false" :gap="16">
      <Box v-for="n in range(2, 5)" :key="n" type="indent-dark" :extra-styles="{ padding: '0' }">
        <img class="about-img" loading="lazy" :src="imgSrc(n)" :alt="'Фото ' + n" />
      </Box>
    </IntGrid>

    <!-- Ярмарка -->
    <Box type="notification">
      В конце второго дня, в воскресенье в 18:00 начинается ярмарка созданных игр, где все участники играют в игры друг друга и оценивают их по номинациям. Можно звать друзей просто посмотреть.
      <br /><br />
      Типичные номинации: красота, лучший геймплей, доделай это, лучший звук, <WeirdText text="что это?" />, и другие номинации от спонсоров.
      <br /><br />
      Чат омского геймдева: <a target="_blank" href="https://t.me/omsky_gamedev">телега</a> или <a target="_blank" href="https://vk.me/join/hV7iMiKbpoS3OUQ93fseqhA8btMBUVtEQRA=">вк</a>
    </Box>

    <!-- Есть ли смысл приходить -->
    <Window icon="/icons/ogd.png" faux title="Есть ли смысл приходить, если ничего не умеешь?">
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <p>
          <Typography shorthand="Bold12">Есть.</Typography>
        </p>
        <br />
        <p>
          На Людум приходят, чтобы повеселиться, пообщаться, самовыразиться, попробовать новые технологии. Это лучшее мероприятие, чтобы сделать свою первую игру, первую программу, первую музыку или арт.
        </p>
        <br />
        <p>
          Если у вас ничего не получилось сделать за два дня, то приходите на ярмарку поиграть в другие игры. Никто не будет вас ругать за то, что вы не доделали игру.
        </p>
      </Box>
    </Window>

    <!-- А можно просто прийти? -->
    <Window icon="/icons/ogd.png" faux title="А можно просто прийти?">
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <p>Можно. Приходите посмотреть, что делают другие. Но сильно не мешайте участникам.</p>
        <br />
        <Box type="indent-dark" :extra-styles="{ padding: '0' }">
          <img class="about-img" loading="lazy" src="/article/images/image_06.jpg" alt="Фото 6" />
        </Box>
      </Box>
    </Window>

    <!-- На чем делать игры -->
    <Window icon="/icons/ogd.png" faux title="На чем делать игры?">
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <ul class="about-list">
          <li>PowerPoint / <a target="_blank" href="https://www.renpy.org/">Renpy</a> / <a target="_blank" href="https://www.rpgmakerweb.com/">RPGMaker</a></li>
          <li>Unity / Godot / UnrealEngine</li>
          <li><a target="_blank" href="https://tic80.com/">TIC80</a> / <a target="_blank" href="https://www.lexaloffle.com/pico-8.php">PICO8</a> и другие <a target="_blank" href="https://paladin-t.github.io/fantasy/index">фентези консоли</a></li>
          <li><a target="_blank" href="https://www.love2d.org/">Love2D</a> на Lua</li>
          <li><a target="_blank" href="https://pixijs.com/">Pixijs</a> / Phaser / <a target="_blank" href="https://threejs.org/">ThreeJs</a> для веба</li>
          <li><a target="_blank" href="https://www.raylib.com/">Raylib</a> если вы хотите C/C++</li>
          <li>LibGDX на kotlin/java</li>
          <li>React — да, можно сделать игру на реакте. Были случаи</li>
          <li>Чистый html canvas (<a target="_blank" href="https://github.com/cat-in-the-dark/ludum_52_omsk/tree/main">например</a>)</li>
          <li>На ардуино и Си</li>
          <li>Ваш собственный движок</li>
        </ul>
        <br />
        <Box type="indent-dark" :extra-styles="{ padding: '0' }">
          <img class="about-img" loading="lazy" src="/article/images/image_07.jpg" alt="Фото 7" />
        </Box>
        <br />
        <p>Здесь не всё. Просто те технологии, которые первые пришли в голову и которые были на прошлых людумах.</p>
      </Box>
    </Window>

    <!-- Расписание -->
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 2" :margin-gap="false" :use-offsets="!shouldBeCompact">
      <Window icon="/icons/calendar.png" data-offset-x="-32" data-offset-y="32" title="Первый день (суббота)" faux>
        <ul style="margin: 16px;">
          <li>7:00 — Анонс темы на сайте <a target="_blank" href="https://ldjam.com/">ldjam.com</a></li>
          <li>10:00 — Открытие коворкинга</li>
          <li>12:00 — Презентация идей на ватманах</li>
          <li>20:00 — Закрытие офиса на ночь</li>
        </ul>
      </Window>
      <Window icon="/icons/calendar.png" data-offset-x="32" title="Второй день (воскресенье)" faux>
        <ul style="margin: 16px;">
          <li>10:00 — Открытие офиса</li>
          <li><Typography shorthand="Bold12">НЕИСТОВОЕ ПРОГРАММИРОВАНИЕ</Typography></li>
          <li>17:00 — Подготовка стендов</li>
          <li>18:05 — Начало ярмарки</li>
          <li>18:30 — Разгар ярмарки. Зовите друзей, родителей, сестер, преподавателей.</li>
          <li>19:00 — Конец ярмарки. Подведение итогов.</li>
          <li>19:30 — Награждения победителей. Праздничный ТОРТ.</li>
          <li>21:00 — Афтепати в баре БирКиндом</li>
        </ul>
      </Window>
    </IntGrid>

    <!-- Фото презентации идей -->
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 3" :margin-gap="false" :gap="8">
      <Box v-for="n in range(8, 13)" :key="n" type="indent-dark" :extra-styles="{ padding: '0' }">
        <img class="about-img" loading="lazy" :src="imgSrc(n)" :alt="'Фото ' + n" />
      </Box>
    </IntGrid>

    <!-- Неистовое программирование -->
    <Window icon="/icons/ogd.png" faux title="НЕИСТОВОЕ ПРОГРАММИРОВАНИЕ">
      <Box type="indent-dark" :extra-styles="{ padding: '0' }">
        <img class="about-img" loading="lazy" src="/article/images/image_14.jpg" alt="Неистовое программирование" />
      </Box>
    </Window>

    <!-- Фото ярмарки -->
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 3" :margin-gap="false" :gap="8">
      <Box v-for="n in range(15, 20)" :key="n" type="indent-dark" :extra-styles="{ padding: '0' }">
        <img class="about-img" loading="lazy" :src="imgSrc(n)" :alt="'Фото ' + n" />
      </Box>
    </IntGrid>

    <!-- Что принести -->
    <Window icon="/icons/ogd.png" faux title="Что принести в офис с собой?">
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <p>В офисе есть столы, стулья, розетки, маркеры, ватманы, бумага.</p>
        <br />
        <p>Чеклист, что взять с собой:</p>
        <ul class="about-list">
          <li><Typography shorthand="Bold12">тапочки!!!</Typography></li>
          <li>удлинитель (может не хватить розеток)</li>
          <li>карандаши, фломастеры</li>
          <li>ноутбук</li>
          <li>можно привезти компьютер и монитор и оставить на ночь в офисе</li>
          <li><Typography shorthand="Bold12">Зарядка для ноута!!!</Typography></li>
          <li>наушники</li>
          <li>графический планшет</li>
          <li>миди клавиатуру</li>
        </ul>
      </Box>
    </Window>

    <!-- ТОРТ -->
    <Window icon="/icons/ogd.png" faux title="ТОРТ">
      <IntGrid mode="columns" :columns="shouldBeCompact ? 2 : 4" :margin-gap="false" :gap="4">
        <Box v-for="n in range(21, 34)" :key="n" type="indent-dark" :extra-styles="{ padding: '0' }">
          <img class="about-img" loading="lazy" :src="imgSrc(n)" :alt="'Торт ' + (n - 20)" />
        </Box>
      </IntGrid>
    </Window>

    <!-- Обед -->
    <IntGrid mode="columns" :columns="shouldBeCompact ? 1 : 2" :margin-gap="false" :use-offsets="!shouldBeCompact">
      <Window icon="/icons/ogd.png" data-offset-x="-16" data-offset-y="16" faux title="Обед будет?">
        <Box type="textarea" :extra-styles="{ padding: '24px' }">
          <p>Обеда не будет. Участники сами заказывают доставку еды. Рекомендуем Лапшу55, Додопиццу, Лаваш и другое.</p>
          <br />
          <p>Все два дня будет зона чаепития: чай, кофе, кипяток, молоко, печенье, пряники, конфеты.</p>
        </Box>
      </Window>
      <Window icon="/icons/ogd.png" data-offset-x="16" faux title="Будут стикеры?">
        <Box type="textarea" :extra-styles="{ padding: '24px' }">
          <p><Typography shorthand="Bold12">ДА.</Typography> А еще можете принести СВОИ СТИКЕРЫ</p>
        </Box>
        <div class="about-stack">
          <Box v-for="n in range(35, 37)" :key="n" type="indent-dark" :extra-styles="{ padding: '0' }">
            <img class="about-img" loading="lazy" :src="imgSrc(n)" :alt="'Стикеры ' + (n - 34)" />
          </Box>
        </div>
      </Window>
    </IntGrid>

    <!-- Хочу помочь -->
    <Window icon="/icons/ogd.png" faux title="Хочу помочь!">
      <Box type="textarea" :extra-styles="{ padding: '24px' }">
        <p>Мы с радостью примем вас в команду организаторов-волонтеров.</p>
        <br />
        <p>Если вы художник, можете сделать стикеры и мы их распечатаем для мероприятия.</p>
        <br />
        <p>Если вы музыкант, то можете скинуть свою музыку и мы ее будем слушать.</p>
        <br />
        <p>А еще можно задонатить: <a target="_blank" href="https://boosty.to/omsky_gamedev">https://boosty.to/omsky_gamedev</a></p>
      </Box>
    </Window>

  </IntGrid>
  <ScrollIndicator />
</template>

<style scoped>
.about-img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.about-title {
  text-align: center;
  padding: 16px;
}

.about-list {
  margin: 8px 0 8px 24px;
}

.about-list li {
  margin-bottom: 4px;
}

.about-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
