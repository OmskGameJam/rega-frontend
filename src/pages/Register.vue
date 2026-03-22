<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Box, Button, Typography, RadioButton, Checkbox, HDivider, Window } from 'win-55-ui-vue'
import WizardInput from '../components/WizardInput.vue'
import FileCopyWindow from '../components/FileCopyWindow.vue'
import BaseTextarea from '../components/BaseTextarea.vue'
import { globalAxios } from '../net/axios'
import { YM_COUNTER } from '../helpers/constants'
import { useResponsiveBreakpoint } from '../composable/useResponsiveBreakpoint'
import AudioButton from '../components/AudioButton.vue'
import { EVENT_NOW } from '../constants'

const router = useRouter()

const { width: viewportWidth, height: viewportHeight } = useResponsiveBreakpoint(0, [640, 1000])
const isMobile = computed(() => viewportWidth.value < 760)

const TOTAL_STEPS = 10

const currentStep = ref(0)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

const windowX = ref(100)
const windowY = ref(50)

const windowWidth = computed(() => isMobile.value ? viewportWidth.value : 760)
const windowHeight = computed(() => isMobile.value ? viewportHeight.value : 660)

onMounted(() => {
  windowX.value = Math.max(0, Math.round((window.innerWidth - 760) / 2))
  windowY.value = Math.max(20, Math.round((window.innerHeight - 660) / 2))
})

const formData = ref({
  name: '',
  exp: '',
  contact: '',
  members: '',
  where: '',
  tech: '',
  prepare: '',
  advice: '',
  joined: false,
  public: true,
  hideteam: false,
})

const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 0: return true
    case 1: return formData.value.name.trim() !== ''
    case 2: return formData.value.exp.trim() !== ''
    case 3: return formData.value.contact.trim() !== ''
    case 4: return formData.value.members.trim() !== ''
    case 5: return formData.value.where !== ''
    case 6: return formData.value.tech.trim() !== ''
    case 7: return formData.value.prepare.trim() !== ''
    case 8: return formData.value.advice.trim() !== ''
    case 9: return formData.value.joined
    default: return true
  }
})

function goNext() {
  if (currentStep.value < TOTAL_STEPS && canGoNext.value) {
    currentStep.value++
  }
}

function goBack() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function goHome() {
  router.push('/')
}

const SIDEBAR_IMAGES: Record<number, string> = {
  0: '/1-welcome.png',
  1: '/2-identity.png',
  2: '/3-experience.png',
  3: '/4-contact.png',
  4: '/5-team.png',
  5: '/6-location.png',
  6: '/7-tech.png',
  7: '/8-prepare.png',
  8: '/9-advice.png',
  9: '/10-legal.png',
  10: '/11-final.png',
}

const sidebarImage = computed(() => SIDEBAR_IMAGES[currentStep.value] ?? SIDEBAR_IMAGES[0])

const summaryText = computed(() =>
  `Команда: ${formData.value.name}\n` +
  `Опыт: ${formData.value.exp}\n` +
  `Контакты: ${formData.value.contact}\n` +
  `О команде: ${formData.value.members}\n` +
  `Где: ${formData.value.where}\n` +
  `Движок: ${formData.value.tech}\n` +
  `Подготовка: ${formData.value.prepare}\n` +
  `Совет: ${formData.value.advice}\n` +
  `Публичная команда: ${formData.value.public ? 'Да' : 'Нет'}\n` +
  `Скрывать участников: ${formData.value.hideteam ? 'Да' : 'Нет'}`
)

async function submit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    const res = await globalAxios.post('/rega', {
      name: formData.value.name,
      exp: formData.value.exp,
      contact: formData.value.contact,
      where: formData.value.where,
      category: 'Jam',
      members: formData.value.members,
      advice: formData.value.advice,
      prepare: formData.value.prepare,
      tech: formData.value.tech,
      public: formData.value.public,
      hideteam: formData.value.hideteam,
    })

    ym(YM_COUNTER, 'reachGoal', 'rega')
    window.localStorage.setItem('my-team', res.data.id)
    window.localStorage.setItem('edition', EVENT_NOW)
    submitSuccess.value = true
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Неизвестная ошибка'
  } finally {
    isSubmitting.value = false
  }
}

function goToTeams() {
  router.push('/teams')
}
</script>

<template>
  <div class="rega-bg" />
  <div class="wizard-overlay">
    <Typography font-color="black">
      <FileCopyWindow :current-step="currentStep" :total-steps="TOTAL_STEPS" />
      <Window
        v-model:x="windowX"
        v-model:y="windowY"
        :width="windowWidth"
        :height="windowHeight"
        :faux="isMobile"
        icon="/icons/rega.png"
        title="Регистрация"
        :extra-styles="{ overflow: 'hidden', display: 'flex', flexDirection: 'column', ...(isMobile ? { left: '0px', top: '0px' } : {}) }"
      >
        <template #titlebar-buttons>
          <AudioButton src="/rega.mid.mp3" />
        </template>
        <div class="wizard-body">
          <div class="wizard-sidebar">
            <img :src="sidebarImage" class="wizard-sidebar-image" draggable="false" />
          </div>

          <div class="wizard-main">
            <div v-if="isMobile" class="wizard-mobile-image-wrap">
              <img :src="sidebarImage" class="wizard-mobile-image" draggable="false">
            </div>
            <!-- Шаг 0: Приветствие -->
            <template v-if="currentStep === 0">
              <Typography shorthand="Bold12" font-color="black">
                Добро пожаловать в мастер регистрации на Игровой Джем
              </Typography>
              <p class="wizard-text">
                Этот мастер поможет вам зарегистрировать команду
                для участия в Игровом Джеме.
              </p>
              <p class="wizard-text">
                Вам предстоит ответить на несколько вопросов
                о вашей команде, опыте и планах.
              </p>
              <p class="wizard-text">
                Нажмите &laquo;Далее&raquo; для продолжения.
              </p>
            </template>

            <!-- Шаг 1: Название команды -->
            <template v-if="currentStep === 1">
              <Typography shorthand="Bold12" font-color="black">
                Название команды
              </Typography>
              <p class="wizard-hint">
                Например, &laquo;Зайчики-попрыгайчики&raquo; или &laquo;Новая команда (1)&raquo;
              </p>
              <WizardInput
                v-model="formData.name"
                placeholder="Новая команда (2)"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 2: Опыт -->
            <template v-if="currentStep === 2">
              <Typography shorthand="Bold12" font-color="black">
                Какой у вас опыт в написании игр?
              </Typography>
              <p class="wizard-hint">
                Не важно, много его у вас или мало, нам просто интересно :)
              </p>
              <WizardInput
                v-model="formData.exp"
                placeholder="0-3 года"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 3: Контакты -->
            <template v-if="currentStep === 3">
              <Typography shorthand="Bold12" font-color="black">
                Оставьте ваши контакты
              </Typography>
              <p class="wizard-hint">
                ВКонтакте, Телеграм, Мой Мир Mail.RU, в какое окно кидать камень
              </p>
              <WizardInput
                v-model="formData.contact"
                placeholder="телеграм: @oleg_gaming"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 4: О команде -->
            <template v-if="currentStep === 4">
              <Typography shorthand="Bold12" font-color="black">
                Расскажите о своей команде!
              </Typography>
              <p class="wizard-hint">
                Кто вы, что вы делаете, всё что угодно
              </p>
              <BaseTextarea
                v-model="formData.members"
                placeholder="Мы - Новая Команда, с нами: Олег - разработчик, Олег (1) - дизайнер"
                :max-length="400"
                :rows="6"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
              />
            </template>

            <!-- Шаг 5: Где хакатонить -->
            <template v-if="currentStep === 5">
              <Typography shorthand="Bold12" font-color="black">
                Где планируете хакатонить?
              </Typography>
              <p class="wizard-hint">
                Можно откуда угодно, но с нами — веселее
              </p>
              <Box type="border-groove" :extra-styles="{ padding: '12px', marginTop: '12px' }">
                <RadioButton
                  v-model="formData.where"
                  value="Из Точки Кипения"
                  label="С нами, из Точки Кипения на Жукова 21"
                />
                <RadioButton
                  v-model="formData.where"
                  value="Из дома"
                  label="Из дома"
                />
                <RadioButton
                  v-model="formData.where"
                  value="И там, и там"
                  label="Из дома, а потом приду в офис на ярмарку"
                />
              </Box>
            </template>

            <!-- Шаг 6: На чём делать игру -->
            <template v-if="currentStep === 6">
              <Typography shorthand="Bold12" font-color="black">
                На чём планируете делать игру?
              </Typography>
              <p class="wizard-hint">
                Unity? Godot? Свой движок, или что-то совсем серьёзное?
              </p>
              <WizardInput
                v-model="formData.tech"
                placeholder="Unreal Bomjine 2"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 7: Подготовка -->
            <template v-if="currentStep === 7">
              <Typography shorthand="Bold12" font-color="black">
                Как будете готовиться?
              </Typography>
              <p class="wizard-hint">
                Читать литературу? Разминаться? Спать?
              </p>
              <WizardInput
                v-model="formData.prepare"
                placeholder="Прочитаю мангу про бетон и лягу спать в 7 утра"
                :max-length="128"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 8: Совет -->
            <template v-if="currentStep === 8">
              <Typography shorthand="Bold12" font-color="black">
                Дайте совет остальным участникам
              </Typography>
              <p class="wizard-hint">
                Пейте водичку и ложитесь спать вовремя!
              </p>
              <WizardInput
                v-model="formData.advice"
                placeholder="Да"
                :max-length="128"
                :extra-styles="{ width: '100%', marginTop: '12px' }"
                @enter="goNext"
              />
            </template>

            <!-- Шаг 9: Чат + Приватность -->
            <template v-if="currentStep === 9">
              <Typography shorthand="Bold12" font-color="black">
                Почти готово!
              </Typography>
              <p class="wizard-label">
                Пожалуйста, подтвердите:
              </p>
              <div style="margin-top: 12px">
                <Checkbox
                  v-model="formData.joined"
                  label="Я зашёл в чат @omsky_gamedev и прочитал о формате Игрового Джема"
                />
              </div>

              <p class="wizard-label" style="margin-top: 30px">
                Приватность команды:
              </p>
              <div style="margin-top: 12px">
                <Checkbox
                  :model-value="!formData.public"
                  label="Не анонсировать регистрацию в чат и скрыть команду из списка участников"
                  @update:model-value="formData.public = !$event"
                />
                <Checkbox
                  v-model="formData.hideteam"
                  label="Скрывать участников команды"
                />
              </div>

              <p class="wizard-privacy-note">
                Отправляя форму вы соглашаетесь с
                <router-link to="/privacy" target="_blank">
                  политикой конфиденциальности
                </router-link>
              </p>
            </template>

            <!-- Шаг 10: Завершение -->
            <template v-if="currentStep === TOTAL_STEPS && !submitSuccess">
              <Typography shorthand="Bold12" font-color="black">
                Завершение регистрации
              </Typography>
              <p class="wizard-summary-note">
                Проверьте данные и нажмите &laquo;Готово&raquo;:
              </p>
              <Box type="textarea" :extra-styles="{ width: '100%', marginTop: '12px', padding: '4px' }">
                <textarea
                  readonly
                  :value="summaryText"
                  class="wizard-summary-textarea"
                  rows="8"
                />
              </Box>
              <p v-if="submitError" class="wizard-error">
                {{ submitError }}
              </p>
            </template>

            <!-- После успешной регистрации -->
            <template v-if="submitSuccess">
              <Typography shorthand="Bold12" font-color="black">
                Регистрация завершена!
              </Typography>
              <p class="wizard-text">
                Ваша команда &laquo;{{ formData.name }}&raquo; успешно
                зарегистрирована на Игровой Джем.
              </p>
              <p class="wizard-text" style="margin-top: 30px">
                Нажмите &laquo;Готово&raquo; чтобы перейти к списку команд.
              </p>
            </template>
          </div>
        </div>

        <HDivider />

        <div class="wizard-footer">
          <template v-if="submitSuccess">
            <Button @click="goToTeams">
              Готово
            </Button>
          </template>
          <template v-else>
            <Button v-if="isMobile" @click="goHome">
              Отмена
            </Button>

            <div class="wizard-footer-nav">
              <span
                :style="{
                  opacity: currentStep === 0 ? 0.5 : 1,
                  pointerEvents: currentStep === 0 ? 'none' : 'auto',
                }"
              >
                <Button @click="goBack">&lt; Назад</Button>
              </span>

              <template v-if="currentStep < TOTAL_STEPS">
                <span
                  :style="{
                    opacity: canGoNext ? 1 : 0.5,
                    pointerEvents: canGoNext ? 'auto' : 'none',
                  }"
                >
                  <Button @click="goNext">Далее &gt;</Button>
                </span>
              </template>
              <template v-else>
                <span
                  :style="{
                    opacity: isSubmitting ? 0.5 : 1,
                    pointerEvents: isSubmitting ? 'none' : 'auto',
                  }"
                >
                  <Button @click="submit">Готово</Button>
                </span>
              </template>

              <template v-if="!isMobile">
                <div style="width: 24px" />
                <Button @click="goHome">
                  Отмена
                </Button>
              </template>
            </div>
          </template>
        </div>
      </Window>
    </Typography>
  </div>
</template>

<style scoped>
.wizard-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.wizard-body {
  display: flex;
  min-height: 510px;
}

.wizard-sidebar {
  width: 246px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #5555ff 0%, #0000aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-sidebar-image {
  image-rendering: pixelated;
  border: 2px solid black;
  position: relative;
  left: 2px;
}

.wizard-main {
  flex: 1;
  padding: 24px 30px;
}

.wizard-text {
  margin-top: 24px;
  line-height: 1.4;
}

.wizard-label {
  margin-top: 18px;
}

.wizard-hint {
  margin-top: 12px;
  opacity: 0.6;
  line-height: 1.3;
}

.wizard-error {
  margin-top: 18px;
  color: red;
}

.wizard-privacy-note {
  margin-top: 30px;
  opacity: 0.6;
  line-height: 1.3;
}

.wizard-privacy-note a {
  color: inherit;
  text-decoration: underline;
}

.wizard-summary-note {
  margin-top: 12px;
  opacity: 0.6;
}

.wizard-summary-textarea {
  width: 100%;
  box-sizing: border-box;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: default;
  font-family: 'Regular12', Arial, sans-serif;
  font-size: 24px;
  color: black;
  line-height: 1.4;
}

.wizard-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 18px;
}

.rega-bg {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: url('/installer-bg.png');
  background-position: top right;
  background-repeat: no-repeat;
  background-size: 100% 100%; /* Width auto, height 100% - stretches vertically */
  animation: fade 1.5s;
}

@media (max-width: 1499px) {
  .rega-bg {
    background-size: auto 100%;
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.wizard-mobile-image-wrap {
  display: none;
}

.wizard-footer-nav {
  display: flex;
  align-items: center;
}

@media (max-width: 760px) {
  .wizard-sidebar {
    display: none;
  }

  .wizard-body {
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }

  .wizard-main {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .wizard-mobile-image-wrap {
    display: block;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .wizard-mobile-image {
    /* Image is 246x510. Rotated 90deg → visually 510x246.
       CSS height (original 510 side) becomes visual width after rotation.
       Set it to fill container width. */
    display: block;
    image-rendering: pixelated;
    border: 2px solid black;
    transform: rotate(90deg);
    height: calc(100vw - 32px);
    width: auto;
    /* Layout box stays 246xH unrotated. Excess vertical space = H*(1 - 246/510) = H*264/510.
       Collapse it equally top/bottom with negative margins. */
    margin: calc((100vw - 32px) * -132 / 510) auto;
  }

  .wizard-footer {
    justify-content: space-between;
  }
}
</style>
