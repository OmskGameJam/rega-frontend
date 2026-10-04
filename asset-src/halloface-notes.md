# Extended Halloface atlas

- `../public/halloface-extended.png`: 4800×2416 atlas, composed of native 16×16 pixel tiles. The island positions, shoreline, buildings, and surrounding ocean follow `the-big-one.png`.
- `halloface-extended-preview.png`: 1200×604 nearest-neighbor overview.
- `halloface-extracted-tiles.png`: 228 distinct layered tiles extracted directly from `halloface.png`, paired with `summer.png` to identify their original artwork.
- `halloface-tileset.png` / `.tsx`: completed 640×576 tileset with original tile IDs, transparency, and terrain rules. Visible pixels are recovered through the original Tiled map; missing pixels use palette shifts.
- `halloface-build.json`: reconstruction statistics.
- `halloface-glitch-areas.png`: five transparent 96×80 patches of deliberately jumbled existing tree, statue, and field sprite fragments. These are placed beside the grove, statue island, castle, house, and fenced field. `halloface-glitches-preview.png` shows each patch with its surroundings. The fixed random seeds make rebuilding repeatable; a pixel comparison verifies that the rest of the atlas stays unchanged. Existing statues and cows retain their earlier appearance.
- `halloface-tree-assemblies.png` / `.tsx`: seven complete 32×32 tree faces extracted directly from `halloface.png`, with transparent sprite silhouettes. The atlas reapplies these as complete assemblies at the 14 tree positions detected in the reference, cycling through the variants. Their quadrants are never matched independently. `halloface-trees-preview.png` shows the forest at native resolution.

Rebuild from the repository root with `python asset-src/build_halloface.py` (Pillow required). No AI image generation is used.

The reference is a 16-color thumbnail at one quarter of native resolution. Tile matching recovers its sampling phase, then places actual full-resolution artwork. Before the whole-tree correction, 44,430 of 45,300 thumbnail tiles match exactly; the remaining 870 use the closest existing tile by palette distance. Whole-tree matching allows the two canopy samples changed by reference palette reduction, requiring the other 39 samples to agree. Each reapplied tree is checked pixel-for-pixel against its extracted assembly. Fine details discarded by the reference cannot be uniquely recovered. The original images and application background selection are preserved.
