<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Box, Typography } from 'win-55-ui-vue'

const props = withDefaults(defineProps<{
  currentStep: number
  totalSteps: number
}>(), {
  currentStep: 0,
  totalSteps: 10,
})

const FILE_PATHS_BY_STEP: string[][] = [
  [
    'C:\\Demos\\FutureCrew\\second_reality.exe',
    'C:\\Windows\\Media\\tada.wav',
    'C:\\Program Files\\Plus!\\themes\\space.theme',
    'C:\\Games\\Shareware\\doom1.wad',
    'C:\\Autoexec.bat',
    'C:\\Config.sys',
    'C:\\Windows\\Logos.sys',
    'C:\\Windows\\System\\logo.bmp',
    'C:\\Install\\setup.exe',
    'C:\\Readme.txt'
  ],
  [
    'C:\\Users\\Public\\handles.lst',
    'C:\\Scene\\Groups\\razor1911.nfo',
    'C:\\Scene\\Groups\\fairlight.nfo',
    'C:\\Temp\\nickgen.exe',
    'C:\\Games\\Saves\\player1.sav',
    'C:\\IRC\\aliases.ini',
    'C:\\BBS\\users.dat',
    'C:\\Windows\\Profiles\\default.pwl',
    'C:\\Net\\whoami.txt',
    'C:\\Temp\\~NICK001.tmp'
  ],
  [
    'C:\\Games\\Doom\\doom.wad',
    'C:\\Games\\Quake\\id1\\pak0.pak',
    'C:\\Tools\\qme\\model_editor.exe',
    'C:\\Tools\\mapedit\\worldcraft.exe',
    'C:\\Borland\\BCC55\\bin\\bcc32.exe',
    'C:\\DJGPP\\bin\\gcc.exe',
    'C:\\Projects\\oldgame\\main.c',
    'C:\\Projects\\demo\\effect.asm',
    'C:\\Temp\\testbuild.exe',
    'C:\\Logs\\crash.log'
  ],
  [
    'C:\\Program Files\\ICQ\\icq.exe',
    'C:\\Program Files\\mIRC\\mirc.exe',
    'C:\\Dial-Up\\phonebook.pbk',
    'C:\\Windows\\System\\rasphone.exe',
    'C:\\Mail\\outbox.mbx',
    'C:\\Mail\\inbox.mbx',
    'C:\\Net\\users.lst',
    'C:\\Inetpub\\wwwroot\\index.html',
    'C:\\Temp\\addrbook.txt',
    'C:\\Drivers\\modem.inf'
  ],
  [
    'C:\\Docs\\design.doc',
    'C:\\Docs\\story.txt',
    'C:\\Art\\sprites\\hero.bmp',
    'C:\\Art\\textures\\wall01.bmp',
    'C:\\Sound\\music\\track01.mid',
    'C:\\Sound\\sfx\\jump.wav',
    'C:\\Code\\engine\\render.cpp',
    'C:\\Code\\game\\ai.c',
    'C:\\Project\\todo.txt',
    'C:\\Project\\credits.txt'
  ],
  [
    'C:\\Network\\lanparty.bat',
    'C:\\Network\\ipx.cfg',
    'C:\\Windows\\System\\nwlink.vxd',
    'C:\\Windows\\System\\vserver.vxd',
    'C:\\Net\\shares\\games',
    'C:\\Remote\\dialup.cmd',
    'C:\\Temp\\pinglog.txt',
    'C:\\Windows\\System\\winipcfg.exe',
    'C:\\Config\\hosts',
    'C:\\Net\\cable_unplugged.err'
  ],
  [
    'C:\\Engines\\build\\build.exe',
    'C:\\Engines\\quake\\qengine.dll',
    'C:\\Engines\\unreal\\unreal.exe',
    'C:\\SDK\\directx\\d3d.dll',
    'C:\\SDK\\opengl\\opengl32.dll',
    'C:\\Libs\\allegro\\allegro.lib',
    'C:\\Libs\\sdl\\sdl.dll',
    'C:\\Tools\\make\\make.exe',
    'C:\\Assets\\models\\player.3ds',
    'C:\\Assets\\textures\\diffuse.pcx'
  ],
  [
    'C:\\Docs\\gamedev\\ai_book.pdf',
    'C:\\Docs\\gamedev\\graphics.txt',
    'C:\\Temp\\ideas.txt',
    'C:\\Music\\mix\\focus.mid',
    'C:\\Utils\\coffee.exe',
    'C:\\Games\\tetris.exe',
    'C:\\Temp\\nap.log',
    'C:\\Schedule\\plan.bat',
    'C:\\Notes\\brainstorm.wri',
    'C:\\Temp\\~SLEEP001.tmp'
  ],
  [
    'C:\\Docs\\readme_first.txt',
    'C:\\Docs\\dont_panic.txt',
    'C:\\Docs\\lessons_learned.txt',
    'C:\\Logs\\postmortem.log',
    'C:\\Temp\\hackfix.diff',
    'C:\\Code\\spaghetti.c',
    'C:\\Code\\final_final2.c',
    'C:\\Docs\\faq.txt',
    'C:\\Temp\\~ADVICE.tmp',
    'C:\\Notes\\ideas_old.bak'
  ],
  [
    'C:\\Docs\\license.txt',
    'C:\\Docs\\gpl.txt',
    'C:\\Docs\\eula.txt',
    'C:\\Docs\\nda.doc',
    'C:\\System\\registry.reg',
    'C:\\Windows\\System\\policy.pol',
    'C:\\Config\\permissions.ini',
    'C:\\Logs\\audit.log',
    'C:\\Temp\\consent.tmp',
    'C:\\Docs\\rules.txt'
  ],
  [
    'C:\\Build\\release\\game.exe',
    'C:\\Build\\release\\data.pak',
    'C:\\Build\\release\\readme.txt',
    'C:\\Build\\release\\setup.exe',
    'C:\\Build\\release\\autorun.inf',
    'C:\\Build\\logs\\build.log',
    'C:\\Build\\final\\gold_master.iso',
    'C:\\Temp\\~FINAL001.tmp',
    'C:\\Upload\\ftp_script.txt',
    'C:\\Release\\v1_0.zip'
  ]
]

const TOTAL_CHUNKS = 23
const MAX_PATH_LENGTH = 34

const currentFileIndex = ref(0)
let fileTimer: ReturnType<typeof setTimeout> | null = null

const currentFileList = computed(() => {
  return FILE_PATHS_BY_STEP[props.currentStep] ?? FILE_PATHS_BY_STEP[0]
})

function pickRandomFile() {
  const list = currentFileList.value
  currentFileIndex.value = Math.floor(Math.random() * list.length)
}

function scheduleNextFile() {
  const delay = 20 + Math.random() * 700
  fileTimer = setTimeout(() => {
    pickRandomFile()
    scheduleNextFile()
  }, delay)
}

watch(() => props.currentStep, () => {
  pickRandomFile()
})

onMounted(() => {
  pickRandomFile()
  scheduleNextFile()
})

onUnmounted(() => {
  if (fileTimer !== null) {
    clearTimeout(fileTimer)
  }
})

const progress = computed(() => props.currentStep / props.totalSteps)
const filledChunks = computed(() => Math.floor(progress.value * TOTAL_CHUNKS))

const displayPath = computed(() => {
  const path = currentFileList.value[currentFileIndex.value]
  if (!path) return ''
  if (path.length <= MAX_PATH_LENGTH) return path
  const keep = Math.floor((MAX_PATH_LENGTH - 3) / 2)
  return path.slice(0, keep) + '...' + path.slice(-keep)
})
</script>

<template>
  <div class="file-copy-anchor">
    <Typography font-color="black">
      <Box type="panel-d-1" :extra-styles="{ width: '420px', padding: '12px 16px' }">
        <Typography shorthand="Bold12" font-color="black">
          Копирование файлов...
        </Typography>
        <br />
        <br />
        <div>
          <Typography shorthand="Regular12" font-color="black">
            {{ displayPath }}
          </Typography>
        </div>
        <div class="progress-track">
          <div
            v-for="i in filledChunks"
            :key="i"
            class="progress-chunk"
          />
        </div>
      </Box>
    </Typography>
  </div>
</template>

<style scoped>
.file-copy-anchor {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 50;
}

.progress-track {
  height: 28px;
  margin-top: 12px;
  display: flex;
  align-items: stretch;
  gap: 2px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background: #c0c0c0;
  padding: 2px;
}

.progress-chunk {
  width: 14px;
  background: #000080;
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .file-copy-anchor :deep(.box) {
    width: calc(100vw - 16px) !important;
  }
}
</style>
