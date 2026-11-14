from pathlib import Path

from PIL import Image


for path in sorted(Path("dist/assets/paintings").glob("*.png")):
    with Image.open(path) as source:
        scaled = source.resize(
            (source.width // 2, source.height // 2), Image.Resampling.LANCZOS
        )
    scaled.save(path)
