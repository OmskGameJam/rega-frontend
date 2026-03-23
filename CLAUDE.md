# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend for "Игровое Варенье" (Game Jam) — an Omsk game development hackathon website. Built with Vue 3 + TypeScript + Vite. Currently on `vue-migration` branch (migrating from React). Deployed to GitHub Pages at `omsky-gamedev.ru`.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # TypeScript compile + Vite bundle
npm run lint      # ESLint (flat config format)
npm run preview   # Preview production build
```

No test framework is configured.

## Tech Stack

- **Vue 3** with Composition API (`<script setup lang="ts">`)
- **Vite 8** build tool
- **TypeScript** (strict mode)
- **Three.js** for 3D effects (WeirdText, Mode7)
- **win-55-ui-vue** — custom retro Win95-style UI component library
- **Axios** for HTTP (`src/net/axios.ts`, base URL from `VITE_REGA_BACK_URL`)
- **Vue Router 4.5** (routes defined in `src/main.ts`)
- **Yandex Maps** + **Yandex.Metrika** for maps/analytics
- No state manager (Pinia/Vuex) — uses component-local refs

## Architecture

```
src/
├── main.ts           # Entry point, router config, global setup
├── App.vue           # Root component with Mode7 background
├── pages/            # Route pages (Home, Register, Teams, Privacy)
├── components/       # Reusable components (Mode7, WeirdText, IntGrid, etc.)
├── composable/       # Vue composables (useResponsiveBreakpoint)
├── helpers/          # Constants
└── net/              # Axios instance
```

Routes are defined inline in `main.ts`: `/` → Home, `/registration` → Register, `/teams` → Teams, `/privacy` → Privacy.

## Key Patterns

- All components use `<script setup lang="ts">` with scoped CSS
- Props via `withDefaults(defineProps<Props>(), {...})`
- Responsive layouts use `IntGrid` component + `useResponsiveBreakpoint` composable
- Environment variables accessed via `import.meta.env.VITE_*` (defined in `.env`)
- Three.js resources must be disposed on unmount (geometries, materials, renderer)
- SPA routing on GitHub Pages: build copies `index.html` to `teams.html`, `privacy.html`
- Analytics: `ym(YM_COUNTER, 'reachGoal', 'goal-name')`

## UI Components (win-55-ui-vue)

Provides: `Window`, `Box`, `Button`, `Typography`, `RadioButton`, `Checkbox`, `NamedPanel`, `HDivider`. Typography uses font size names like "Bold12", "Regular24".

## ESLint Config

Flat config format (`eslint.config.js`). Key overrides: `vue/multi-word-component-names` is off, `vue/html-self-closing` is warn (always close tags).
