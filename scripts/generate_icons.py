#!/usr/bin/env python3
"""
Generador automatizado de iconos para Android y PWA/Web de CalculadoraBCV.
"""

import base64
import io
from pathlib import Path
from PIL import Image, ImageDraw


def main():
    repo_root = Path(__file__).resolve().parent.parent
    b64_file = Path(__file__).resolve().parent / "icon.b64"

    if not b64_file.exists():
        print(f"Archivo de icono {b64_file} no encontrado, omitiendo.")
        return

    with open(b64_file, "r", encoding="utf-8") as f:
        img_bytes = base64.b64decode(f.read().strip())

    card = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    w, h = card.size

    # Mascara squircle
    res = w * 4
    mask_hi = Image.new("L", (res, res), 0)
    draw_hi = ImageDraw.Draw(mask_hi)
    draw_hi.rounded_rectangle([(0, 0), (res, res)], radius=int(w * 0.19 * 4), fill=255)
    mask_squircle = mask_hi.resize((w, h), Image.Resampling.LANCZOS)

    squircle_card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    squircle_card.paste(card, (0, 0), mask_squircle)

    # Mascara circular
    mask_circle_hi = Image.new("L", (res, res), 0)
    draw_circle_hi = ImageDraw.Draw(mask_circle_hi)
    draw_circle_hi.ellipse([(0, 0), (res, res)], fill=255)
    mask_circle = mask_circle_hi.resize((w, h), Image.Resampling.LANCZOS)

    round_card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    round_card.paste(card, (0, 0), mask_circle)

    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    base_res = repo_root / "android" / "app" / "src" / "main" / "res"

    for folder, (launcher_sz, fg_sz) in densities.items():
        folder_path = base_res / folder
        folder_path.mkdir(parents=True, exist_ok=True)

        squircle_card.resize((launcher_sz, launcher_sz), Image.Resampling.LANCZOS).save(
            folder_path / "ic_launcher.png", "PNG"
        )
        round_card.resize((launcher_sz, launcher_sz), Image.Resampling.LANCZOS).save(
            folder_path / "ic_launcher_round.png", "PNG"
        )

        inner_sz = int(fg_sz * 0.70)
        img_inner = squircle_card.resize((inner_sz, inner_sz), Image.Resampling.LANCZOS)
        offset = (fg_sz - inner_sz) // 2

        fg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        fg_canvas.paste(img_inner, (offset, offset), img_inner)
        fg_canvas.save(folder_path / "ic_launcher_foreground.png", "PNG")

    public_dir = repo_root / "public"
    public_dir.mkdir(parents=True, exist_ok=True)
    squircle_card.resize((512, 512), Image.Resampling.LANCZOS).save(
        public_dir / "app-icon.png", "PNG"
    )
    squircle_card.resize((192, 192), Image.Resampling.LANCZOS).save(
        public_dir / "icon-192.png", "PNG"
    )
    squircle_card.resize((64, 64), Image.Resampling.LANCZOS).save(
        public_dir / "favicon.png", "PNG"
    )
    print("Iconos generados exitosamente!")


if __name__ == "__main__":
    main()
