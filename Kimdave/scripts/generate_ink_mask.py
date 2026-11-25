"""Generate a 24-frame organic darkroom ink-wash alpha mask sprite (8160x255 WebP)."""

from pathlib import Path
import numpy as np
from PIL import Image

ROOT_DIR = Path(__file__).resolve().parent.parent
OUT_SPRITE = ROOT_DIR / "src" / "assets" / "masks" / "theme-ink-sprite.webp"
PREVIEW_PATH = Path(
    r"C:\Users\echoe\.gemini\antigravity\brain\52129fc0-32af-492a-abe5-5012a106aa7c\scratch\ink_mask_preview.png"
)

FRAME_COUNT = 24
FRAME_W = 340
FRAME_H = 255


def fbm_field(
    w: int,
    h: int,
    octaves: list[int],
    weights: list[float],
    rng: np.random.Generator,
) -> np.ndarray:
    """Build multi-octave smooth value noise in [0, 1] using bicubic Pillow resampling."""
    acc = np.zeros((h, w), dtype=np.float32)
    weight_sum = 0.0
    aspect = h / w

    for freq_x, weight in zip(octaves, weights):
        grid_w = max(2, freq_x)
        grid_h = max(2, round(freq_x * aspect))
        grid = rng.random((grid_h, grid_w), dtype=np.float32)
        up = Image.fromarray(grid, mode="F").resize((w, h), Image.Resampling.BICUBIC)
        acc += np.asarray(up, dtype=np.float32) * weight
        weight_sum += weight

    acc /= weight_sum
    min_v = float(acc.min())
    max_v = float(acc.max())
    return (acc - min_v) / max(1e-6, max_v - min_v)


def bilinear_sample(field: np.ndarray, sample_x: np.ndarray, sample_y: np.ndarray) -> np.ndarray:
    """Sample a 2D array at normalized [0, 1] coordinates via reflected bilinear interpolation."""
    h, w = field.shape
    ref_x = 1.0 - np.abs(1.0 - np.abs(sample_x))
    ref_y = 1.0 - np.abs(1.0 - np.abs(sample_y))
    fx = np.clip(ref_x, 0.0, 1.0) * (w - 1)
    fy = np.clip(ref_y, 0.0, 1.0) * (h - 1)

    x0 = np.floor(fx).astype(np.int32)
    y0 = np.floor(fy).astype(np.int32)
    x1 = np.minimum(x0 + 1, w - 1)
    y1 = np.minimum(y0 + 1, h - 1)

    dx = fx - x0
    dy = fy - y0

    v00 = field[y0, x0]
    v10 = field[y0, x1]
    v01 = field[y1, x0]
    v11 = field[y1, x1]

    top = v00 * (1.0 - dx) + v10 * dx
    bottom = v01 * (1.0 - dx) + v11 * dx
    return top * (1.0 - dy) + bottom * dy


def build_reveal_field(w: int, h: int, seed: int = 42) -> np.ndarray:
    """Compute a normalized [0, 1] diagonal ink-wash reveal field from top-right to bottom-left."""
    rng = np.random.default_rng(seed)

    xs = np.linspace(0.0, 1.0, w, dtype=np.float32)
    ys = np.linspace(0.0, 1.0, h, dtype=np.float32)
    x, y = np.meshgrid(xs, ys)

    # Diagonal sweep distance radiating from top-right theme toggle origin
    d = np.sqrt(((x - 1.06) * 1.12) ** 2 + ((y + 0.06) * 0.94) ** 2)

    # Smooth domain warp for fluid ink tendrils
    warp_octaves = [4, 8, 16, 32]
    warp_weights = [0.46, 0.28, 0.16, 0.10]
    warp_x = fbm_field(w, h, warp_octaves, warp_weights, rng) - 0.5
    warp_y = fbm_field(w, h, warp_octaves, warp_weights, rng) - 0.5

    warped_x = x + 0.15 * warp_x
    warped_y = y + 0.15 * warp_y

    # 6-octave ragged ink coastline noise sampled at warped coordinates
    ink_raw = fbm_field(
        w,
        h,
        octaves=[5, 10, 20, 40, 80, 160],
        weights=[0.34, 0.26, 0.18, 0.11, 0.07, 0.04],
        rng=rng,
    )
    ink_noise = bilinear_sample(ink_raw, warped_x, warped_y)

    # Organic satellite droplets & splatter islands near advancing front
    drop_coarse = fbm_field(w, h, octaves=[22, 44], weights=[0.6, 0.4], rng=rng)
    drop_fine = fbm_field(w, h, octaves=[64, 128], weights=[0.55, 0.45], rng=rng)
    splatters = np.clip((drop_coarse - 0.62) / 0.38, 0.0, 1.0) * 0.72 + np.clip(
        (drop_fine - 0.69) / 0.31, 0.0, 1.0
    ) * 0.45

    field = d + 0.56 * ink_noise - 0.16 * splatters
    f_min = float(field.min())
    f_max = float(field.max())
    return (field - f_min) / max(1e-6, f_max - f_min)


def render_frames(field: np.ndarray) -> list[np.ndarray]:
    """Render 24 RGBA alpha mask frames from the reveal field."""
    h, w = field.shape
    frames: list[np.ndarray] = []

    for idx in range(FRAME_COUNT):
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        if idx == 0:
            alpha = np.zeros((h, w), dtype=np.uint8)
        elif idx == FRAME_COUNT - 1:
            alpha = np.full((h, w), 255, dtype=np.uint8)
        else:
            t = idx / (FRAME_COUNT - 1)
            progress = t * t * (3.0 - 2.0 * t)
            thresh = -0.03 + 1.06 * progress
            alpha_f = np.clip((thresh - field) / 0.018, 0.0, 1.0) * 255.0
            alpha = np.rint(alpha_f).astype(np.uint8)

        rgba[:, :, 3] = alpha
        frames.append(rgba)

    return frames


def save_contact_sheet(frames: list[np.ndarray], out_path: Path) -> None:
    """Save a 3x2 ivory contact sheet of sample mask frames for visual inspection."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sample_indices = [3, 6, 10, 14, 18, 21]
    pad = 12
    cols, rows = 3, 2
    sheet_w = cols * FRAME_W + (cols + 1) * pad
    sheet_h = rows * FRAME_H + (rows + 1) * pad

    sheet = Image.new("RGB", (sheet_w, sheet_h), (247, 245, 240))
    black_tile = Image.new("RGB", (FRAME_W, FRAME_H), (14, 14, 14))

    for slot, frame_idx in enumerate(sample_indices):
        col = slot % cols
        row = slot // cols
        x0 = pad + col * (FRAME_W + pad)
        y0 = pad + row * (FRAME_H + pad)
        mask_l = Image.fromarray(frames[frame_idx][:, :, 3], mode="L")
        sheet.paste(black_tile, (x0, y0), mask=mask_l)

    sheet.save(out_path, format="PNG")


def main() -> None:
    field = build_reveal_field(FRAME_W, FRAME_H, seed=42)
    frames = render_frames(field)

    sprite_arr = np.concatenate(frames, axis=1)
    sprite_img = Image.fromarray(sprite_arr, mode="RGBA")

    OUT_SPRITE.parent.mkdir(parents=True, exist_ok=True)
    sprite_img.save(OUT_SPRITE, format="WEBP", quality=90, alpha_quality=92, method=6)
    save_contact_sheet(frames, PREVIEW_PATH)

    size_kb = OUT_SPRITE.stat().st_size / 1024
    print(f"Sprite: {OUT_SPRITE}")
    print(f"Dimensions: {sprite_img.width}x{sprite_img.height} ({FRAME_COUNT} frames @ {FRAME_W}x{FRAME_H})")
    print(f"Size: {size_kb:.1f} KiB ({OUT_SPRITE.stat().st_size} bytes)")
    print(f"Preview: {PREVIEW_PATH}")


if __name__ == "__main__":
    main()
