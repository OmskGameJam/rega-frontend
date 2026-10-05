# Game of Life background benchmark

## Isolated baseline rerun

The initial shared-canvas comparison below is superseded for before/after
conclusions by an isolated rerun. Solid fill and cached overlay each ran in a
separate Chrome process with a fresh profile. The solid-fill run never created
a background cache or executed either gradient implementation. Each variant
still uses the same material drawing loop, deterministic cells, and batch
readback methodology. These measure drawing, not the entire pre-change app.

| Width | Original solid-fill full draw | Cached-overlay full draw | Difference |
| --- | ---: | ---: | ---: |
| 360 | 1.06 ms | 1.48 ms | +0.42 ms (+39%) |
| 960 | 2.10 ms | 4.93 ms | +2.83 ms (+135%) |
| 1920 | 6.09 ms | 8.69 ms | +2.60 ms (+43%) |

Background-only flat/cached times: 0.11/0.29 ms, 0.52/0.50 ms,
and 0.76/0.98 ms respectively. Full-draw cost does not equal the sum of isolated
background and material costs: browser batching and rendering strategy differ.
The earlier claim of only 5% overhead is not supported by this isolated rerun.
Separate processes also introduce run-to-run variance; these results need live
app profiling before being treated as a universal regression estimate.

Raw samples: clean-flat.json and clean-cached.json. Open the generated page with
`?variant=flat` or `?variant=cached` in separate fresh browser processes to repeat.
Cache rebuilds measured 16.70, 25.30, and 68.80 ms for the three widths.

## Initial shared-canvas comparison

Measured in headless Chrome 154 on Windows, 2026-10-05. Canvas height: 512 pixels.
Nine samples per variant, 30 draws per sample, rotating variant order. Numbers
are median milliseconds per draw. Full draw uses the component's actual
material drawing function with identical deterministic cells: 12% Life, 3% sand.
No emitters. Simulation, Vue updates, and page composition are excluded.

| Width | Flat full draw | Uncached dither full draw | Cached dither full draw | Cache rebuild |
| --- | ---: | ---: | ---: | ---: |
| 360 | 1.97 ms | 10.91 ms | 2.03 ms | 16.90 ms |
| 960 | 4.84 ms | 27.98 ms | 5.09 ms | 30.00 ms |
| 1920 | 7.42 ms | 36.14 ms | 7.06 ms | 48.40 ms |

At 960 pixels, caching reduces full draw time by about 82% versus calculating
dithering every draw. Against the original flat fill it adds about 0.24 ms, or 5%.
The apparent improvement versus flat fill at 1920 pixels is within benchmark
variability; it does not establish that the overlay is faster than a flat fill.

Background-only results and all samples are in life-background-results.json.
The rowGradient variant is a reconstructed row gradient that computes its colors
per draw; it is not the earlier precomputed row-color implementation.

One 1-pixel getImageData readback per batch forces queued canvas work to finish.
Its cost is included and amortized over 30 draws. Repeated readbacks can affect
browser rendering strategy, so these are comparative microbenchmark results,
not live application frame rates. Cache rebuild measurements also include a
readback. Actual startup/resize costs can differ when work is deferred.

To reproduce, run `node benchmarks/life-background.mjs`, then open the generated
life-background.html in Chrome. The page runs synchronously and displays JSON
when complete. It extracts createBackground and draw from GameOfLife.vue.
Uncached dithering is a hypothetical per-frame implementation, not a previously
shipped version: the dithered component was cached from its first implementation.
