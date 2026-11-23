"""Build smaller WebP display copies; never alter the original artwork."""

from pathlib import Path

from PIL import Image


PUBLIC = Path(__file__).resolve().parents[1] / "public"


def optimize(source, target, bounds, quality):
    source = PUBLIC / source
    target = PUBLIC / target
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        alpha = "A" in original.getbands() or "transparency" in original.info
        image = original.convert("RGBA" if alpha else "RGB")
        image.thumbnail(bounds, Image.Resampling.LANCZOS)
        image.save(target, format="WEBP", quality=quality, method=6, exact=alpha)
    print(f"{target.relative_to(PUBLIC)}: {source.stat().st_size:,} → {target.stat().st_size:,} bytes")


for name, width, height, quality in (
    ("raddie-cosmic-garden", 1920, 1080, 83),
    ("cardstock-grain-v2", 680, 900, 88),
    ("gray-matte-print-v4", 640, 220, 90),
    ("clear-pouch-v2", 800, 900, 86),
    ("holographic-seal-v2", 144, 144, 88),
):
    optimize(f"assets/lab/{name}.png", f"assets/lab/optimized/{name}.webp", (width, height), quality)

for name in (
    "perxio-workspace", "hapopus-haptics", "dance-plus", "wildsit-game", "raddie-sprite-pipeline",
    "daily-lazcash-assistant-temp", "teleagent-campaign-temp", "vibe-coding-navigator",
    "realtime-voice-chat", "tarot-story-game",
):
    optimize(f"assets/lab/projects/{name}.jpg", f"assets/lab/optimized/{name}.webp", (680, 680), 89)

for source, name, bounds, quality in (
    ("assets/lab/raddie-cosmic-garden.png", "lab/optimized/raddie-cosmic-garden-mobile", (1280, 720), 81),
    ("assets/home/intro-background.png", "home/optimized/intro-background", (1672, 941), 84),
    ("assets/home/intro-background.png", "home/optimized/intro-background-mobile", (1280, 720), 82),
    ("assets/home/portfolio-title.png", "home/optimized/portfolio-title", (1312, 546), 90),
    ("assets/ip/luobogou/scenes/country-street.png", "home/optimized/country-street", (1920, 1080), 84),
    ("assets/ip/luobogou/scenes/mushroom-forest-night.jpg", "home/optimized/mushroom-forest-night", (1920, 1080), 85),
    ("assets/ip/luobogou/scenes/dream-home.png", "home/optimized/dream-home", (1920, 1080), 84),
    ("assets/gallery-night-sky.png", "home/optimized/gallery-night-sky", (1920, 1080), 83),
    ("assets/home/about/felt-board.png", "home/optimized/about-felt-board", (1083, 610), 88),
    ("assets/home/skills/felt-board.png", "home/optimized/skills-felt-board", (1061, 597), 88),
):
    optimize(source, f"assets/{name}.webp", bounds, quality)
