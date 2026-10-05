"""Rebuild the large atlas using actual 16px tiles, never synthesized imagery.

Run from the repository root: python asset-src/build_halloface.py
Requires Pillow. The 4px reference tiles are thumbnails of 16px source tiles.
"""
from collections import Counter
from collections import defaultdict
from pathlib import Path
import json
import random
import xml.etree.ElementTree as ET
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "asset-src"
PUBLIC = ROOT / "public"
SIZE = 16


def main():
    reference = Image.open(PUBLIC / "the-big-one.png").convert("RGB")
    summer = Image.open(PUBLIC / "summer.png").convert("RGB")
    halloween = Image.open(PUBLIC / "halloface.png").convert("RGB")
    source = Image.open(ASSETS / "Overworld-sakura.png").convert("RGBA")
    reference_palette = Image.open(PUBLIC / "the-big-one.png").getpalette()[:48]
    colors = [tuple(reference_palette[i:i + 3]) for i in range(0, 48, 3)]
    target_palette = Image.open(PUBLIC / "halloface.png").getpalette()[:48]
    target_colors = [tuple(target_palette[i:i + 3]) for i in range(0, 48, 3)]
    color_cache = {}

    def color_index(rgb):
        rgb = tuple(rgb[:3])
        if rgb not in color_cache:
            color_cache[rgb] = min(range(16), key=lambda i: sum((a-b)**2 for a, b in zip(rgb, colors[i])))
        return color_cache[rgb]

    def indexed(tile):
        return bytes(color_index(p) for p in tile.getdata())

    def shifted(tile):
        result = Image.new("RGBA", tile.size)
        result.putdata([(*target_colors[color_index(p)], p[3]) for p in tile.getdata()])
        return result

    # Extract complete, layered tiles directly from the Halloween image.
    candidates = []
    seen = set()
    for y in range(0, summer.height, SIZE):
        for x in range(0, summer.width, SIZE):
            box = (x, y, x + SIZE, y + SIZE)
            original = summer.crop(box)
            actual = halloween.crop(box)
            key = (original.tobytes(), actual.tobytes())
            if key not in seen:
                seen.add(key)
                candidates.append((indexed(original), actual, "extracted"))
    extracted_count = len(candidates)

    # Complete the sprite sheet by shifting each palette entry, including tiles
    # absent from the screenshot. Preserve transparency and tile coordinates.
    # Recover each visible sprite pixel through the original Tiled layer IDs.
    # This retains the screenshot's dithering and pumpkin/stone colors rather
    # than relying on a coarse palette approximation for known tiles.
    tile_samples = defaultdict(Counter)
    palette_samples = defaultdict(Counter)
    tilemap = ET.parse(next(ASSETS.glob("*.tmx"))).getroot()
    layers = [[int(v) for v in layer.find("data").text.replace("\n", "").split(",") if v.strip()]
              for layer in tilemap.findall("layer")]
    source_pixels = source.load()
    halloween_pixels = halloween.load()
    for cell in range(summer.width // SIZE * (summer.height // SIZE)):
        cx, cy = cell % 80 * SIZE, cell // 80 * SIZE
        for ty in range(SIZE):
            for tx in range(SIZE):
                for layer in reversed(layers):
                    gid = layer[cell]
                    if not gid:
                        continue
                    tile_id = (gid & 0x0fffffff) - 1
                    sx, sy = tile_id % 40 * SIZE + tx, tile_id // 40 * SIZE + ty
                    pixel = source_pixels[sx, sy]
                    if pixel[3] == 255:
                        color = halloween_pixels[cx + tx, cy + ty]
                        tile_samples[sx, sy][color] += 1
                        palette_samples[pixel[:3]][color] += 1
                        break
                    if pixel[3] > 0:
                        break
    complete = shifted(source)
    completed_pixels = complete.load()
    for sy in range(source.height):
        for sx in range(source.width):
            pixel = source_pixels[sx, sy]
            if (sx, sy) in tile_samples:
                color = tile_samples[sx, sy].most_common(1)[0][0]
            elif pixel[:3] in palette_samples:
                color = palette_samples[pixel[:3]].most_common(1)[0][0]
            else:
                continue
            completed_pixels[sx, sy] = (*color, pixel[3])
    complete.save(ASSETS / "halloface-tileset.png")
    tileset = ET.parse(ASSETS / "Overworld.tsx")
    tileset.getroot().set("name", "Halloface")
    tileset.getroot().find("image").set("source", "halloface-tileset.png")
    tileset.write(ASSETS / "halloface-tileset.tsx", encoding="UTF-8", xml_declaration=True)
    for y in range(0, source.height, SIZE):
        for x in range(0, source.width, SIZE):
            box = (x, y, x + SIZE, y + SIZE)
            original = source.crop(box)
            actual = complete.crop(box)
            if original.getbbox() is None:
                continue
            for background in (10, 8, 5, 3):
                base = Image.new("RGBA", (SIZE, SIZE), (*colors[background], 255))
                base.alpha_composite(original)
                output = Image.new("RGBA", (SIZE, SIZE), (*target_colors[background], 255))
                output.alpha_composite(actual)
                candidates.append((indexed(base), output.convert("RGB"), "palette-shift"))

    reference_tiles = []
    for y in range(0, reference.height, 4):
        for x in range(0, reference.width, 4):
            reference_tiles.append(indexed(reference.crop((x, y, x + 4, y + 4))))
    frequencies = Counter(reference_tiles)

    # Recover the downsampling phase from the reference rather than resizing
    # its pixels back up. All output pixels come from full-resolution tiles.
    best = None
    for py in range(4):
        for px in range(4):
            lookup = {}
            for ci, (pixels, _, _) in enumerate(candidates):
                thumb = bytes(pixels[(py + yy * 4) * SIZE + px + xx * 4] for yy in range(4) for xx in range(4))
                lookup.setdefault(thumb, ci)
            score = sum(count for key, count in frequencies.items() if key in lookup)
            if best is None or score > best[0]:
                best = (score, px, py, lookup)
    score, px, py, lookup = best
    distances = [[sum((a-b)**2 for a, b in zip(c1, c2)) for c2 in colors] for c1 in colors]
    matches = {}
    approximate = 0
    for key in frequencies:
        if key in lookup:
            matches[key] = lookup[key]
        else:
            approximate += frequencies[key]
            closest = min(lookup, key=lambda thumb: sum(distances[a][b] for a, b in zip(key, thumb)))
            matches[key] = lookup[closest]

    output = Image.new("RGB", (reference.width * 4, reference.height * 4))
    columns = reference.width // 4
    for n, key in enumerate(reference_tiles):
        output.paste(candidates[matches[key]][1], ((n % columns) * SIZE, (n // columns) * SIZE))

    # Trees occupy four tiles. Match and replace the whole assembly: resolving
    # their quadrants independently can combine different Halloween faces.
    tree = Image.open(ASSETS / "Overworld.png").convert("RGBA").crop((80, 256, 112, 288))
    tree_pixels = list(tree.getdata())
    pink_checks = [(i % 32, i // 32, p[:3]) for i, p in enumerate(tree_pixels)
                   if p[3] == 255 and p[0] > p[1] and p[2] > p[1]][::8]
    tree_positions = [(x, y) for y in range(0, summer.height - 31, SIZE)
                      for x in range(0, summer.width - 31, SIZE)
                      if all(summer.getpixel((x + dx, y + dy)) == rgb
                             for dx, dy, rgb in pink_checks)]
    # This assembly overlaps the partially clipped tree at the top edge, so
    # its pink-pixel signature differs. Its complete face is still available.
    tree_positions.insert(1, (0, 32))
    tree_mask = Image.new("L", (32, 32))
    tree_mask.putdata([255 if p[3] else 0 for p in tree_pixels])
    tree_variants = []
    tree_keys = set()
    for x, y in tree_positions:
        variant = halloween.crop((x, y, x + 32, y + 32)).convert("RGBA")
        variant.putalpha(tree_mask)
        key = variant.tobytes()
        if key not in tree_keys:
            tree_keys.add(key)
            tree_variants.append(variant)
    tree_sheet = Image.new("RGBA", (32 * len(tree_variants), 32))
    for n, variant in enumerate(tree_variants):
        tree_sheet.paste(variant, (n * 32, 0))
    tree_sheet.save(ASSETS / "halloface-tree-assemblies.png")
    assemblies = ET.Element("tileset", name="Halloface trees", tilewidth="32",
                            tileheight="32", tilecount=str(len(tree_variants)),
                            columns=str(len(tree_variants)))
    ET.SubElement(assemblies, "image", source="halloface-tree-assemblies.png",
                  width=str(tree_sheet.width), height="32")
    ET.ElementTree(assemblies).write(ASSETS / "halloface-tree-assemblies.tsx",
                                    encoding="UTF-8", xml_declaration=True)

    # Identify the full pink tree silhouette in the small reference. Only
    # opaque canopy pixels participate, so terrain and shadow backgrounds do
    # not prevent a match. Place exact extracted face pixels at native size.
    tree_checks = []
    for yy in range(8):
        for xx in range(8):
            p = tree.getpixel((px + xx * 4, py + yy * 4))
            if p[3] == 255 and p[0] > p[1] and p[2] > p[1]:
                tree_checks.append((xx, yy, color_index(p)))
    ref_pixels = reference.load()
    placements = []
    for y in range(0, reference.height - 7, 4):
        for x in range(0, reference.width - 7, 4):
            # The reference's reduced palette changes two canopy samples in
            # every tree. All 39 other samples must still agree as an assembly.
            if sum(color_index(ref_pixels[x + dx, y + dy]) != color
                   for dx, dy, color in tree_checks) <= 2:
                placements.append((x * 4, y * 4))
    for n, (x, y) in enumerate(placements):
        # Stable distribution of complete variants; no quadrant mixing.
        variant = tree_variants[n % len(tree_variants)]
        output.paste(variant, (x, y), variant.getchannel("A"))
        # Verify every visible pixel belongs to the selected complete face.
        for ty in range(32):
            for tx in range(32):
                if tree_mask.getpixel((tx, ty)):
                    assert output.getpixel((x + tx, y + ty)) == variant.getpixel((tx, ty))[:3]

    # Add deliberate sprite jumble beside landmarks without altering their
    # existing assemblies. Everything comes from extracted image pixels.
    glitch_areas = [
        ("tree grove", 1680, 912),
        ("statue island", 2608, 1008),
        ("castle", 3136, 1008),
        ("house", 1920, 1472),
        ("fenced field", 1904, 1648),
    ]
    fragments = []
    for variant in tree_variants:
        for ty in range(0, 32, 16):
            for tx in range(0, 32, 16):
                fragments.append(variant.crop((tx, ty, tx + 16, ty + 16)))
    for x, y in [(800, 224), (704, 256), (768, 320)]:
        for ty in range(0, 48, 16):
            for tx in range(0, 32, 16):
                fragments.append(halloween.crop((x + tx, y + ty, x + tx + 16, y + ty + 16)).convert("RGBA"))
    for x, y in [(0, 752), (16, 768), (48, 768), (32, 784)]:
        fragments.append(halloween.crop((x, y, x + 16, y + 16)).convert("RGBA"))

    before_glitches = output.copy()
    allowed_changes = Image.new("L", output.size)
    glitch_sheet = Image.new("RGBA", (96 * len(glitch_areas), 80))
    glitch_preview = Image.new("RGB", (160 * len(glitch_areas), 144))
    for area_index, (name, x, y) in enumerate(glitch_areas):
        rng = random.Random(5500 + area_index)
        patch = Image.new("RGBA", (96, 80))
        # Scattered tiles, with several tiles assembled from mismatched halves.
        for n, cell in enumerate(rng.sample(range(30), 15)):
            tile = rng.choice(fragments).copy()
            if n % 3 == 0:
                tile.paste(rng.choice(fragments).crop((8, 0, 16, 16)), (8, 0))
            if n % 4 == 0:
                tile.paste(rng.choice(fragments).crop((0, 8, 16, 16)), (0, 8))
            patch.alpha_composite(tile, ((cell % 6) * 16, (cell // 6) * 16))
        glitch_sheet.paste(patch, (area_index * 96, 0))
        output.paste(patch, (x, y), patch.getchannel("A"))
        allowed_changes.paste(255, (x, y, x + 96, y + 80))
        glitch_preview.paste(output.crop((x - 32, y - 32, x + 128, y + 112)), (area_index * 160, 0))
    difference = ImageChops.difference(before_glitches, output)
    difference.paste((0, 0, 0), (0, 0), allowed_changes)
    assert difference.getbbox() is None, "Existing artwork changed outside glitch areas"
    glitch_sheet.save(ASSETS / "halloface-glitch-areas.png")
    glitch_preview.save(ASSETS / "halloface-glitches-preview.png")

    output.save(PUBLIC / "halloface-extended.png", optimize=True)
    output.resize(reference.size, Image.Resampling.NEAREST).save(ASSETS / "halloface-extended-preview.png")
    output.crop((1632, 656, 1952, 864)).save(ASSETS / "halloface-trees-preview.png")

    extracted_sheet = Image.new("RGB", (32 * SIZE, ((extracted_count + 31) // 32) * SIZE), (0, 0, 63))
    for n, (_, tile, _) in enumerate(candidates[:extracted_count]):
        extracted_sheet.paste(tile, ((n % 32) * SIZE, (n // 32) * SIZE))
    extracted_sheet.save(ASSETS / "halloface-extracted-tiles.png")
    report = dict(size=list(output.size), tile_size=SIZE, extracted_tiles=extracted_count,
                  reference_tiles=len(reference_tiles), exact_thumbnail_matches=score,
                  nearest_thumbnail_matches=approximate, sampling_phase=[px, py],
                  tree_assemblies=len(tree_variants), tree_placements=placements,
                  glitch_areas=[dict(landmark=name, x=x, y=y, width=96, height=80)
                                for name, x, y in glitch_areas])
    (ASSETS / "halloface-build.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
