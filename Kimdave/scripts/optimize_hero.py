"""Generate responsive, ICC-preserved, EXIF-stripped WebP and 4:4:4 JPEG derivatives."""

from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT_DIR / "raw-assets"
HERO_OUT_DIR = ROOT_DIR / "src" / "assets" / "hero"
GALLERY_OUT_DIR = ROOT_DIR / "src" / "assets" / "gallery"

WEBP_MAX_BYTES_2000 = 480 * 1024


def prepare_master(source_path: Path) -> tuple[Image.Image, bytes | None]:
    """Load a raw master image, apply EXIF orientation, convert to RGB, and extract ICC profile."""
    if not source_path.exists():
        raise FileNotFoundError(f"Missing master file: {source_path}")

    with Image.open(source_path) as im:
        icc_profile = im.info.get("icc_profile")
        transposed = ImageOps.exif_transpose(im)
        rgb = transposed.convert("RGB")
        return rgb, icc_profile


def resize_and_sharpen(master: Image.Image, target_width: int) -> Image.Image:
    """Proportionally resize an image using Lanczos and apply mild web output sharpening."""
    orig_w, orig_h = master.size
    target_height = round(orig_h * (target_width / orig_w))
    resized = master.resize((target_width, target_height), Image.Resampling.LANCZOS)
    return resized.filter(ImageFilter.UnsharpMask(radius=0.8, percent=50, threshold=2))


def save_webp_derivative(
    img: Image.Image,
    out_path: Path,
    icc_profile: bytes | None,
    max_bytes: int | None = None,
) -> None:
    """Save a WebP derivative, optionally stepping quality down (90->84) to honor a byte cap."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    extra_kwargs = {"icc_profile": icc_profile} if icc_profile else {}

    quality = 90
    while True:
        img.save(out_path, format="WEBP", quality=quality, method=6, **extra_kwargs)
        if max_bytes is None or out_path.stat().st_size <= max_bytes or quality <= 84:
            break
        quality -= 2


def save_jpeg_derivative(
    img: Image.Image,
    out_path: Path,
    icc_profile: bytes | None,
) -> None:
    """Save a progressive 4:4:4 chroma JPEG derivative with stripped EXIF/GPS metadata."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    extra_kwargs = {"icc_profile": icc_profile} if icc_profile else {}
    img.save(
        out_path,
        format="JPEG",
        quality=88,
        subsampling=0,
        progressive=True,
        optimize=True,
        **extra_kwargs,
    )


def verify_output(path: Path) -> tuple[str, str, float, int, int]:
    """Inspect a saved derivative for dimensions, size (KB), ICC length, and EXIF count."""
    with Image.open(path) as im:
        icc_len = len(im.info.get("icc_profile") or b"")
        exif_count = len(im.getexif())
        size_kb = path.stat().st_size / 1024
        dims = f"{im.width}x{im.height}"
    return (path.name, dims, size_kb, icc_len, exif_count)


def generate_derivatives(
    source_path: Path,
    out_dir: Path,
    base_name: str,
    widths: list[int],
    webp_caps: dict[int, int] | None = None,
) -> list[tuple[str, str, float, int, int]]:
    """Generate WebP + 4:4:4 JPEG derivatives at each requested width."""
    master, icc_profile = prepare_master(source_path)
    results: list[tuple[str, str, float, int, int]] = []
    caps = webp_caps or {}

    for width in widths:
        derivative = resize_and_sharpen(master, width)
        webp_path = out_dir / f"{base_name}-{width}.webp"
        jpg_path = out_dir / f"{base_name}-{width}.jpg"

        save_webp_derivative(derivative, webp_path, icc_profile, max_bytes=caps.get(width))
        save_jpeg_derivative(derivative, jpg_path, icc_profile)

        results.append(verify_output(webp_path))
        results.append(verify_output(jpg_path))

    return results


def main() -> None:
    rows: list[tuple[str, str, float, int, int]] = []

    rows.extend(
        generate_derivatives(
            source_path=RAW_DIR / "IMG_2988.jpg",
            out_dir=HERO_OUT_DIR,
            base_name="hero-editorial-portrait",
            widths=[800, 1400, 2000],
            webp_caps={2000: WEBP_MAX_BYTES_2000},
        )
    )

    rows.extend(
        generate_derivatives(
            source_path=RAW_DIR / "IMG_0173.jpg",
            out_dir=GALLERY_OUT_DIR,
            base_name="birthday-portrait-0173",
            widths=[1200],
        )
    )

    print(f"{'File':<36} {'Dimensions':<12} {'Size (KB)':>10} {'ICC (B)':>9} {'EXIF':>6}")
    print("-" * 77)
    for name, dims, size_kb, icc_len, exif_count in rows:
        print(f"{name:<36} {dims:<12} {size_kb:>10.1f} {icc_len:>9} {exif_count:>6}")


if __name__ == "__main__":
    main()
