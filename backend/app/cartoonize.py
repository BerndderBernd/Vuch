from PIL import Image, ImageFilter, ImageOps
from pathlib import Path


def cartoonize_image(input_path: str, output_path: str) -> None:
    """
    Simple, fast cartoonize approximation using PIL filters.
    This is a placeholder; can be swapped with Stable Diffusion or external API.
    """
    src_path = Path(input_path)
    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(src_path).convert("RGB")

    # Edge detection and posterization for a cartoon-like effect
    edges = img.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.invert(edges).convert("L").point(lambda x: 0 if x < 120 else 255, mode='1')

    # Reduce color palette
    poster = img.convert("P", palette=Image.ADAPTIVE, colors=32).convert("RGB")
    poster = poster.filter(ImageFilter.SMOOTH_MORE)

    # Composite edges on top
    poster.putalpha(255)
    edges_rgba = Image.new("RGBA", img.size, (0, 0, 0, 0))
    edges_rgba.putalpha(ImageOps.invert(edges.convert("L")))
    result = Image.alpha_composite(poster.convert("RGBA"), edges_rgba)

    result.save(out_path)

