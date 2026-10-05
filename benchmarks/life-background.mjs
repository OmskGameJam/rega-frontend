import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/components/GameOfLife.vue', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const constants = source.slice(source.indexOf('const CELL_SIZE'), source.indexOf('const STEP_MS'))
function extract(name) {
  const start = source.indexOf(`function ${name}(`)
  return source.slice(start, source.indexOf('\n}\n', start) + 2)
}
const implementation = ts.transpile(`${constants}\n${extract('createBackground')}\n${extract('draw')}`, { target: ts.ScriptTarget.ES2022 })
const html = `<!doctype html><meta charset="utf-8"><pre id="result">Running</pre><script>window.onerror = (message, url, line) => { document.getElementById('result').textContent = message + ' at ' + line; };</script><script>
let context, background, columns, rows, cells;
const canvasRef = {value: document.createElement('canvas')};
document.body.append(canvasRef.value);
const LIFE = 1, SAND = 2, emitterSlots = [];
${implementation}
const flat = () => { context.fillStyle = '#00004477'; context.fillRect(0, 0, canvasRef.value.width, HEIGHT); };
const rowGradient = () => {
  for (let y = 0; y < BACKGROUND_ROWS; y++) {
    const blue = Math.round(68 * (1 - y / (BACKGROUND_ROWS - 1)));
    context.fillStyle = '#0000' + blue.toString(16).padStart(2, '0') + '77';
    context.fillRect(0, y * CELL_SIZE, canvasRef.value.width, Math.min(CELL_SIZE, HEIGHT - y * CELL_SIZE));
  }
};
const uncached = () => {
  for (let y = 0; y < BACKGROUND_ROWS; y++) {
    const level = y / (BACKGROUND_ROWS - 1) * (BACKGROUND_LEVELS - 1);
    const lower = Math.floor(level);
    const blend = Math.max(0, Math.min(1, (level - lower - .3) / .4));
    for (let x = 0; x < Math.ceil(canvasRef.value.width / CELL_SIZE); x++) {
      const threshold = (BAYER_4[(y % 4) * 4 + x % 4] + .5) / 16;
      context.fillStyle = BACKGROUND_COLORS[Math.min(BACKGROUND_LEVELS - 1, lower + Number(blend > threshold))];
      context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
};
const cached = () => context.drawImage(background, 0, 0);
const materialSource = ${JSON.stringify(ts.transpile(extract('draw'), {target:ts.ScriptTarget.ES2022}).replace('function draw()', 'function materials()').replace('if (background) context.drawImage(background, 0, 0);', ''))};
eval(materialSource);
const isolatedVariant = new URLSearchParams(location.search).get('variant');
const variants = isolatedVariant === 'flat' ? {flat} : isolatedVariant === 'cached' ? {cached} : {flat, rowGradient, uncached, cached};
const results = [];
const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length/2)];
// A readback once per batch flushes deferred canvas work; its fixed overhead is amortized.
function batch(fn, count = 30) {
  const start = performance.now();
  for (let i = 0; i < count; i++) fn();
  context.getImageData(0, 0, 1, 1);
  return (performance.now() - start) / count;
}
for (const width of [360, 960, 1920]) {
  canvasRef.value.width = width; canvasRef.value.height = HEIGHT;
  context = canvasRef.value.getContext('2d');
  columns = Math.floor(width / CELL_SIZE); rows = Math.floor(HEIGHT / CELL_SIZE);
  cells = new Uint8Array(columns * rows);
  let seed = 12345;
  for (let i = 0; i < cells.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const chance = seed / 4294967296;
    cells[i] = chance < .12 ? LIFE : chance < .15 ? SAND : 0;
  }
  const buildSamples = [];
  for (let i = 0; i < (isolatedVariant === 'flat' ? 0 : 9); i++) {
    const start = performance.now(); background = createBackground(width);
    background.getContext('2d').getImageData(0, 0, 1, 1);
    buildSamples.push(performance.now() - start);
  }
  for (const full of [false, true]) {
    const samples = Object.fromEntries(Object.keys(variants).map(key => [key, []]));
    const functions = Object.fromEntries(Object.entries(variants).map(([key, fn]) => [key, () => { fn(); if (full) materials(); }]));
    for (const fn of Object.values(functions)) batch(fn);
    for (let round = 0; round < 9; round++) {
      const keys = Object.keys(variants);
      for (let offset = 0; offset < keys.length; offset++) {
        const key = keys[(round + offset) % keys.length];
        samples[key].push(batch(functions[key]));
      }
    }
    results.push({width, mode: full ? 'full draw, 15% occupied' : 'background only', medianMs: Object.fromEntries(Object.entries(samples).map(([key, values]) => [key, median(values)])), samplesMs: samples, rebuildMedianMs: buildSamples.length ? median(buildSamples) : null});
  }
}
document.getElementById('result').textContent = JSON.stringify({userAgent:navigator.userAgent, batchSize:30, rounds:9, results}, null, 2);
</script>`
fs.writeFileSync(new URL('./life-background.html', import.meta.url), html)
