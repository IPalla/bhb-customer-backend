import os
import sys
import shutil
from pathlib import Path

from PIL import Image, UnidentifiedImageError


SOURCE_DIR = Path("images-to-optimize")
TARGET_DIR = Path("images-optimized")
TARGET_SIZE = 800 * 1024  # 800KB
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def ensure_directory(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)


def get_image_quality(file_size: int) -> int:
    if file_size <= TARGET_SIZE:
        return 95
    if file_size <= TARGET_SIZE * 2:
        return 85
    if file_size <= TARGET_SIZE * 4:
        return 75
    if file_size <= TARGET_SIZE * 8:
        return 65
    return 55


def optimize_image(source_path: Path, target_path: Path, max_attempts: int = 5) -> bool:
    try:
        original_size = source_path.stat().st_size

        if original_size <= TARGET_SIZE:
            shutil.copy2(source_path, target_path)
            print(f"Copied {source_path} (already under 800KB)")
            return True

        image = Image.open(source_path)

        # Flatten transparency before JPEG conversion.
        if image.mode in ("RGBA", "LA") or (
            image.mode == "P" and "transparency" in image.info
        ):
            background = Image.new("RGB", image.size, (255, 255, 255))
            alpha = image.split()[3] if image.mode == "RGBA" else None
            background.paste(image, mask=alpha)
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")

        quality = get_image_quality(original_size)
        temp_path = target_path.with_suffix(f"{target_path.suffix}.temp")

        for attempt in range(max_attempts):
            image.save(temp_path, "JPEG", quality=quality, optimize=True)
            new_size = temp_path.stat().st_size

            if new_size <= TARGET_SIZE or attempt == max_attempts - 1:
                os.replace(temp_path, target_path)
                print(
                    f"Optimized {source_path}: "
                    f"{original_size / 1024:.1f}KB -> {new_size / 1024:.1f}KB (q={quality})"
                )
                return True

            if new_size > TARGET_SIZE * 1.5:
                quality -= 10
            elif new_size > TARGET_SIZE * 1.2:
                quality -= 5
            else:
                quality -= 2

            quality = max(quality, 40)

        return False
    except UnidentifiedImageError:
        print(f"Error: unsupported or invalid image file: {source_path}")
        return False
    except Exception as error:  # noqa: BLE001
        print(f"Error optimizing {source_path}: {error}")
        return False


def main() -> None:
    if not SOURCE_DIR.exists():
        print(f"Error: source directory '{SOURCE_DIR}' not found.")
        sys.exit(1)

    ensure_directory(TARGET_DIR)

    total = 0
    optimized = 0
    copied = 0
    failed = 0

    for source_file in SOURCE_DIR.rglob("*"):
        if not source_file.is_file():
            continue
        if source_file.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        total += 1
        relative = source_file.relative_to(SOURCE_DIR)
        target_file = (TARGET_DIR / relative).with_suffix(".jpg")
        ensure_directory(target_file.parent)

        success = optimize_image(source_file, target_file)
        if not success:
            failed += 1
            continue

        source_size = source_file.stat().st_size
        target_size = target_file.stat().st_size
        if source_size == target_size:
            copied += 1
        else:
            optimized += 1

    print("\nOptimization complete")
    print(f"Total images processed: {total}")
    print(f"Optimized: {optimized}")
    print(f"Copied (already under 800KB): {copied}")
    print(f"Failed: {failed}")
    print(f"Output directory: {TARGET_DIR.resolve()}")


if __name__ == "__main__":
    main()
