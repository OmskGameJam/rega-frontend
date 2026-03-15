import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { win55ui } from 'win-55-ui-vue/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), win55ui()],
})
