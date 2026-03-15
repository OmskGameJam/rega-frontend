import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createYmaps } from 'vue-yandex-maps'
import App from './App.vue'
import 'win-55-ui-vue/style.css'
import './index.css'

import TeamsPage from './pages/Teams.vue'
import PrivacyPage from './pages/Privacy.vue'
import RegisterPage from './pages/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/register', component: RegisterPage },
    { path: '/teams', component: TeamsPage },
    { path: '/privacy', component: PrivacyPage },
  ],
})

const app = createApp(App)
app.use(router)
app.use(createYmaps({ apikey: '4d1af35d-5954-46a5-8f53-883add76bfbf' }))
app.mount('#root')
