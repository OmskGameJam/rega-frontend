import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { win55ui } from 'win-55-ui-vue/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), win55ui()],
  resolve: {
    alias: {
      'win-55-ui-vue/style.css': resolve(__dirname, 'node_modules/win-55-ui-vue/dist/index.css'),
    },
  },
})
