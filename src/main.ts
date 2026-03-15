import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createYmaps } from 'vue-yandex-maps'
import App from './App.vue'
import 'win-55-ui-vue/style.css'
import './index.css'

import HomePage from './pages/Home.vue'
import TeamsPage from './pages/Teams.vue'
import PrivacyPage from './pages/Privacy.vue'
import RegisterPage from './pages/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/register', component: RegisterPage },
    { path: '/teams', component: TeamsPage },
    { path: '/privacy', component: PrivacyPage },
  ],
})

const app = createApp(App)
app.use(router)
app.use(createYmaps({ apikey: import.meta.env.VITE_YMAPS_APIKEY }))
app.mount('#root')
