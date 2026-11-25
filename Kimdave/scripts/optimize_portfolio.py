"""Organize curated raw masters and generate sRGB WebP/JPEG portfolio derivatives."""

from __future__ import annotations

import argparse
import concurrent.futures
import io
import json
import os
import shutil
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = ROOT_DIR / "scripts" / "curated_manifest.json"
DEFAULT_CONTACT_SHEETS_DIR = Path(
    r"C:\Users\echoe\.gemini\antigravity\brain\52129fc0-32af-492a-abe5-5012a106aa7c\scratch"
)

WIDTH_THUMB = 800
WIDTH_FULL = 1600
BUDGET_WEBP_800 = 130 * 1024
BUDGET_WEBP_1600 = 350 * 1024

SRGB_PROFILE = ImageCms.createProfile("sRGB")
SRGB_BYTES = ImageCms.ImageCmsProfile(SRGB_PROFILE).tobytes()


@dataclass
class ProcessedItem:
    id: str
    slug: str
    project_slug: str
    filename: str
    marker: str
    raw_bytes: int
    icc_action: str
    width: int
    height: int
    webp_800_bytes: int
    jpg_800_bytes: int
    webp_1600_bytes: int
    jpg_1600_bytes: int
    jpg_800_path: Path


def sync_master(src_path: Path, dst_path: Path) -> None:
    """Copy a raw master into curated/ locally without altering the source archive."""
    if not src_path.exists():
        raise FileNotFoundError(f"Missing source master in archive: {src_path}")
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    if not dst_path.exists() or dst_path.stat().st_size != src_path.stat().st_size:
        shutil.copy2(src_path, dst_path)


def load_master_as_srgb(master_path: Path) -> tuple[Image.Image, str]:
    """Load image, apply EXIF orientation, convert non-sRGB ICC profiles to sRGB."""
    with Image.open(master_path) as im:
        icc_bytes = im.info.get("icc_profile")
        transposed = ImageOps.exif_transpose(im)
        rgb = transposed.convert("RGB")

    if not icc_bytes:
        return rgb, "none->sRGB"

    try:
        src_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc_bytes))
        desc = (ImageCms.getProfileDescription(src_profile) or "").strip()
        if "srgb" in desc.lower():
            return rgb, "sRGB"

        converted = ImageCms.profileToProfile(
            rgb,
            src_profile,
            SRGB_PROFILE,
            renderingIntent=ImageCms.Intent.PERCEPTUAL,
            outputMode="RGB",
        )
        return converted, f"{desc}->sRGB"
    except ImageCms.PyCMSError as exc:
        raise RuntimeError(f"ICC conversion failed for {master_path.name}: {exc}") from exc


def resize_proportionally(master: Image.Image, max_width: int) -> Image.Image:
    """Downscale proportionally to max_width with LANCZOS + subtle sharpening; never upscale."""
    orig_w, orig_h = master.size
    if orig_w <= max_width:
        resized = master.copy()
    else:
        target_h = round(orig_h * (max_width / orig_w))
        resized = master.resize((max_width, target_h), Image.Resampling.LANCZOS)
    return resized.filter(ImageFilter.UnsharpMask(radius=0.75, percent=45, threshold=2))


def save_webp_with_budget(
    img: Image.Image,
    out_path: Path,
    start_quality: int,
    min_quality: int,
    max_bytes: int,
) -> int:
    """Save sRGB WebP (EXIF stripped), stepping down by 2 to fit max_bytes via in-memory trials."""
    out_path.parent.mkdir(parents=True, exist_ok=True)

    def encode(q: int) -> bytes:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=q, method=6, icc_profile=SRGB_BYTES)
        return buf.getvalue()

    best_data = encode(start_quality)
    if len(best_data) > max_bytes and min_quality < start_quality:
        # Check min_quality floor first; if still over budget, no intermediate pass can fit.
        floor_data = encode(min_quality)
        if len(floor_data) > max_bytes:
            best_data = floor_data
        else:
            candidates = list(range(start_quality - 2, min_quality - 1, -2))
            for idx, q in enumerate(candidates):
                if q == min_quality:
                    best_data = floor_data
                    break
                data = encode(q)
                if len(data) <= max_bytes:
                    best_data = data
                    break
                if idx == len(candidates) - 1:
                    best_data = floor_data

    out_path.write_bytes(best_data)
    return len(best_data)


def save_jpeg_master_quality(img: Image.Image, out_path: Path, quality: int) -> int:
    """Save progressive 4:4:4 sRGB JPEG with EXIF/GPS stripped."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(
        out_path,
        format="JPEG",
        quality=quality,
        subsampling=0,
        progressive=True,
        optimize=True,
        icc_profile=SRGB_BYTES,
    )
    return out_path.stat().st_size


def verify_derivative(path: Path) -> None:
    """Assert file exists, has zero EXIF tags, and carries an ICC profile."""
    if not path.exists():
        raise AssertionError(f"Missing expected output: {path}")
    with Image.open(path) as im:
        exif_count = len(im.getexif())
        if exif_count != 0:
            raise AssertionError(f"EXIF metadata leak ({exif_count} tags) in {path}")
        if not im.info.get("icc_profile"):
            raise AssertionError(f"Missing embedded sRGB ICC profile in {path}")


def generate_contact_sheet(
    project_slug: str,
    title: str,
    items: list[ProcessedItem],
    out_dir: Path,
) -> Path:
    """Build a 4-column visual contact sheet with metadata labels for grounding."""
    out_dir.mkdir(parents=True, exist_ok=True)
    cols = 4
    tile_w = 360
    tile_img_h = 360
    label_h = 44
    pad = 16
    header_h = 54

    rows = (len(items) + cols - 1) // cols
    sheet_w = pad + cols * (tile_w + pad)
    sheet_h = header_h + pad + rows * (tile_img_h + label_h + pad)

    canvas = Image.new("RGB", (sheet_w, sheet_h), (24, 24, 24))
    draw = ImageDraw.Draw(canvas)

    try:
        title_font = ImageFont.truetype("arial.ttf", 20)
        label_font = ImageFont.truetype("arial.ttf", 12)
    except OSError:
        title_font = ImageFont.load_default()
        label_font = ImageFont.load_default()

    draw.text(
        (pad, 16),
        f"{project_slug} — {title} ({len(items)} curated photos)",
        fill=(245, 245, 245),
        font=title_font,
    )

    for idx, item in enumerate(items):
        r = idx // cols
        c = idx % cols
        x0 = pad + c * (tile_w + pad)
        y0 = header_h + pad + r * (tile_img_h + label_h + pad)

        # Tile matte box
        draw.rectangle([x0, y0, x0 + tile_w, y0 + tile_img_h], fill=(12, 12, 12))
        with Image.open(item.jpg_800_path) as thumb:
            fitted = thumb.copy()
            fitted.thumbnail((tile_w - 8, tile_img_h - 8), Image.Resampling.LANCZOS)
            tx = x0 + (tile_w - fitted.width) // 2
            ty = y0 + (tile_img_h - fitted.height) // 2
            canvas.paste(fitted, (tx, ty))

        # White label bar below image
        ly0 = y0 + tile_img_h
        draw.rectangle([x0, ly0, x0 + tile_w, ly0 + label_h], fill=(248, 248, 248))
        line1 = f"{item.id} | {item.filename} ({item.marker})"
        line2 = f"{item.width}x{item.height} | 800w:{item.webp_800_bytes/1024:.0f}KB | 1600w:{item.webp_1600_bytes/1024:.0f}KB | {item.icc_action}"
        draw.text((x0 + 8, ly0 + 5), line1, fill=(20, 20, 20), font=label_font)
        draw.text((x0 + 8, ly0 + 22), line2, fill=(90, 90, 90), font=label_font)

    out_path = out_dir / f"contact_sheet_{project_slug}.jpg"
    canvas.save(out_path, format="JPEG", quality=88, optimize=True, icc_profile=SRGB_BYTES)
    return out_path


def write_generated_ts(items: list[ProcessedItem], out_ts_path: Path) -> None:
    """Emit static Vite ES imports and typed helper for all curated portfolio assets."""
    out_ts_path.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = [
        "// AUTO-GENERATED BY scripts/optimize_portfolio.py — DO NOT EDIT MANUALLY.",
        "",
        "import type { ProjectImage } from '../types';",
        "",
    ]

    for item in items:
        ident = item.slug.replace("-", "_")
        base_import = f"../../assets/projects/{item.project_slug}/{item.slug}"
        lines.append(f"import {ident}_w800 from '{base_import}-800.webp';")
        lines.append(f"import {ident}_w1600 from '{base_import}-1600.webp';")
        lines.append(f"import {ident}_j800 from '{base_import}-800.jpg';")
        lines.append(f"import {ident}_j1600 from '{base_import}-1600.jpg';")

    lines.extend(
        [
            "",
            "export interface CuratedAssetRecord {",
            "  readonly id: string;",
            "  readonly projectSlug: string;",
            "  readonly width: number;",
            "  readonly height: number;",
            "  readonly orientation: 'portrait' | 'landscape';",
            "  readonly webp800: string;",
            "  readonly webp1600: string;",
            "  readonly jpg800: string;",
            "  readonly jpg1600: string;",
            "}",
            "",
            "export const curatedAssets = {",
        ]
    )

    for item in items:
        ident = item.slug.replace("-", "_")
        orientation = "landscape" if item.width > item.height else "portrait"
        lines.extend(
            [
                f"  '{item.id}': {{",
                f"    id: '{item.id}',",
                f"    projectSlug: '{item.project_slug}',",
                f"    width: {item.width},",
                f"    height: {item.height},",
                f"    orientation: '{orientation}',",
                f"    webp800: {ident}_w800,",
                f"    webp1600: {ident}_w1600,",
                f"    jpg800: {ident}_j800,",
                f"    jpg1600: {ident}_j1600,",
                "  },",
            ]
        )

    lines.extend(
        [
            "} as const satisfies Record<string, CuratedAssetRecord>;",
            "",
            "export type CuratedAssetId = keyof typeof curatedAssets;",
            "",
            "export interface ToProjectImageOptions {",
            "  alt: string;",
            "  caption?: string;",
            "  focalPoint?: string;",
            "  isCover?: boolean;",
            "}",
            "",
            "export function toProjectImage(",
            "  id: CuratedAssetId,",
            "  options: ToProjectImageOptions",
            "): ProjectImage {",
            "  const asset = curatedAssets[id];",
            "  return {",
            "    id: asset.id,",
            "    src: asset.jpg1600,",
            "    thumbSrc: asset.jpg800,",
            "    webpSrcSet: `${asset.webp800} 800w, ${asset.webp1600} 1600w`,",
            "    jpgSrcSet: `${asset.jpg800} 800w, ${asset.jpg1600} 1600w`,",
            "    lightboxWebp: asset.webp1600,",
            "    lightboxJpg: asset.jpg1600,",
            "    width: asset.width,",
            "    height: asset.height,",
            "    alt: options.alt,",
            "    ...(options.caption !== undefined ? { caption: options.caption } : {}),",
            "    ...(options.focalPoint !== undefined ? { focalPoint: options.focalPoint } : {}),",
            "    ...(options.isCover !== undefined ? { isCover: options.isCover } : {}),",
            "  };",
            "}",
            "",
        ]
    )

    out_ts_path.write_text("\n".join(lines), encoding="utf-8")


def outputs_are_fresh(master_path: Path, out_paths: tuple[Path, ...]) -> bool:
    """Return True if all outputs already exist, pass verification, and post-date the master."""
    master_mtime = master_path.stat().st_mtime
    for p in out_paths:
        if not p.exists() or p.stat().st_size == 0 or p.stat().st_mtime < master_mtime:
            return False
        try:
            verify_derivative(p)
        except Exception:
            return False
    return True


def detect_icc_label(master_path: Path) -> str:
    """Inspect source ICC description quickly without re-encoding."""
    with Image.open(master_path) as im:
        icc_bytes = im.info.get("icc_profile")
    if not icc_bytes:
        return "none->sRGB"
    src_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc_bytes))
    desc = (ImageCms.getProfileDescription(src_profile) or "").strip()
    return "sRGB" if "srgb" in desc.lower() else f"{desc}->sRGB"


def process_entry(
    project_slug: str,
    entry: dict,
    source_root: Path,
    curated_raw_dir: Path,
    output_assets_dir: Path,
    force: bool,
) -> ProcessedItem:
    """Sync master, convert color profile if needed, emit 4 derivatives, and verify."""
    src_path = source_root / entry["sourceRelPath"]
    curated_master = (
        curated_raw_dir
        / project_slug
        / entry["curatedSubdir"]
        / src_path.name
    )
    sync_master(src_path, curated_master)

    proj_out_dir = output_assets_dir / project_slug
    slug = entry["slug"]
    w800_path = proj_out_dir / f"{slug}-800.webp"
    j800_path = proj_out_dir / f"{slug}-800.jpg"
    w1600_path = proj_out_dir / f"{slug}-1600.webp"
    j1600_path = proj_out_dir / f"{slug}-1600.jpg"
    out_tuple = (w800_path, j800_path, w1600_path, j1600_path)

    if not force and outputs_are_fresh(curated_master, out_tuple):
        with Image.open(j1600_path) as full_im:
            full_w, full_h = full_im.size
        processed = ProcessedItem(
            id=entry["id"],
            slug=slug,
            project_slug=project_slug,
            filename=src_path.name,
            marker=entry.get("marker", ""),
            raw_bytes=curated_master.stat().st_size,
            icc_action=detect_icc_label(curated_master),
            width=full_w,
            height=full_h,
            webp_800_bytes=w800_path.stat().st_size,
            jpg_800_bytes=j800_path.stat().st_size,
            webp_1600_bytes=w1600_path.stat().st_size,
            jpg_1600_bytes=j1600_path.stat().st_size,
            jpg_800_path=j800_path,
        )
        print(f"  [cached] {processed.id} ({processed.filename})", flush=True)
        return processed

    master_rgb, icc_action = load_master_as_srgb(curated_master)
    img_800 = resize_proportionally(master_rgb, WIDTH_THUMB)
    img_1600 = resize_proportionally(master_rgb, WIDTH_FULL)

    w800_b = save_webp_with_budget(img_800, w800_path, 84, 76, BUDGET_WEBP_800)
    j800_b = save_jpeg_master_quality(img_800, j800_path, 85)
    w1600_b = save_webp_with_budget(img_1600, w1600_path, 86, 78, BUDGET_WEBP_1600)
    j1600_b = save_jpeg_master_quality(img_1600, j1600_path, 86)

    for out_p in out_tuple:
        verify_derivative(out_p)

    processed = ProcessedItem(
        id=entry["id"],
        slug=slug,
        project_slug=project_slug,
        filename=src_path.name,
        marker=entry.get("marker", ""),
        raw_bytes=curated_master.stat().st_size,
        icc_action=icc_action,
        width=img_1600.width,
        height=img_1600.height,
        webp_800_bytes=w800_b,
        jpg_800_bytes=j800_b,
        webp_1600_bytes=w1600_b,
        jpg_1600_bytes=j1600_b,
        jpg_800_path=j800_path,
    )
    print(
        f"  [done]   {processed.id} ({processed.filename}) -> "
        f"800w={w800_b/1024:.0f}KB, 1600w={w1600_b/1024:.0f}KB ({icc_action})",
        flush=True,
    )
    return processed


def main() -> None:
    parser = argparse.ArgumentParser(description="Optimize curated portfolio images.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument(
        "--contact-sheets-dir",
        type=Path,
        default=DEFAULT_CONTACT_SHEETS_DIR,
    )
    parser.add_argument("--no-contact-sheets", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    default_source_root = Path(manifest["sourceRoot"])
    curated_raw_dir = ROOT_DIR / manifest["curatedRawDir"]
    output_assets_dir = ROOT_DIR / manifest["outputAssetsDir"]
    generated_ts_path = ROOT_DIR / manifest["generatedTsPath"]

    tasks: list[tuple[str, Path, dict]] = []
    for project in manifest["projects"]:
        proj_source_root = Path(project.get("sourceRoot", default_source_root))
        for entry in project["items"]:
            tasks.append((project["projectSlug"], proj_source_root, entry))

    workers = min(6, os.cpu_count() or 4)
    print(f"Optimizing {len(tasks)} images using {workers} threads...", flush=True)

    processed_by_id: dict[str, ProcessedItem] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        future_map = {
            pool.submit(
                process_entry,
                p_slug,
                entry,
                proj_source_root,
                curated_raw_dir,
                output_assets_dir,
                args.force,
            ): entry["id"]
            for p_slug, proj_source_root, entry in tasks
        }
        for fut in concurrent.futures.as_completed(future_map):
            item = fut.result()
            processed_by_id[item.id] = item

    all_items: list[ProcessedItem] = []
    project_groups: list[tuple[str, str, list[ProcessedItem]]] = []
    for project in manifest["projects"]:
        p_items = [processed_by_id[entry["id"]] for entry in project["items"]]
        all_items.extend(p_items)
        project_groups.append((project["projectSlug"], project["title"], p_items))

    write_generated_ts(all_items, generated_ts_path)

    contact_paths: list[Path] = []
    if not args.no_contact_sheets:
        for p_slug, p_title, p_items in project_groups:
            contact_paths.append(
                generate_contact_sheet(p_slug, p_title, p_items, args.contact_sheets_dir)
            )

    print(
        f"{'ID':<10} {'Source':<18} {'Dims':<10} {'ICC':<20} "
        f"{'Raw(MB)':>8} {'800w(KB)':>9} {'1600w(KB)':>10} {'Budget':>8}"
    )
    print("-" * 102)
    total_raw = 0
    total_webp = 0
    total_all = 0
    over_budget: list[str] = []

    for item in all_items:
        total_raw += item.raw_bytes
        total_webp += item.webp_800_bytes + item.webp_1600_bytes
        total_all += (
            item.webp_800_bytes
            + item.jpg_800_bytes
            + item.webp_1600_bytes
            + item.jpg_1600_bytes
        )
        ok_800 = item.webp_800_bytes <= BUDGET_WEBP_800
        ok_1600 = item.webp_1600_bytes <= BUDGET_WEBP_1600
        status = "OK" if (ok_800 and ok_1600) else "OVER"
        if not ok_800 or not ok_1600:
            over_budget.append(item.id)
        dims = f"{item.width}x{item.height}"
        print(
            f"{item.id:<10} {item.filename:<18} {dims:<10} {item.icc_action:<20} "
            f"{item.raw_bytes/1048576:>8.2f} {item.webp_800_bytes/1024:>9.1f} "
            f"{item.webp_1600_bytes/1024:>10.1f} {status:>8}"
        )

    raw_mb = total_raw / 1048576
    webp_mb = total_webp / 1048576
    all_mb = total_all / 1048576
    print("-" * 102)
    print(f"Processed images : {len(all_items)} ({len(all_items) * 4} derivatives verified, EXIF=0, sRGB ICC embedded)")
    print(f"Total raw size   : {raw_mb:.2f} MB")
    print(f"WebP tier total  : {webp_mb:.2f} MB ({(1 - webp_mb / raw_mb) * 100:.1f}% reduction vs raw)")
    print(f"All 4-tier total : {all_mb:.2f} MB ({(1 - all_mb / raw_mb) * 100:.1f}% reduction vs raw)")
    print(f"Over budget      : {over_budget if over_budget else 'None'}")
    print(f"Generated TS     : {generated_ts_path}")
    for cp in contact_paths:
        print(f"Contact sheet    : {cp}")


if __name__ == "__main__":
    main()
