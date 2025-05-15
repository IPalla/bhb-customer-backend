import os
import sys
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import shutil

# Target file size in bytes (800 KB)
TARGET_SIZE = 800 * 1024

def ensure_directory(directory):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory):
        os.makedirs(directory)

def get_image_quality(file_size):
    """Calculate appropriate quality setting based on file size"""
    if file_size <= TARGET_SIZE:
        return 95  # Already small enough, use high quality
    elif file_size <= TARGET_SIZE * 2:
        return 85
    elif file_size <= TARGET_SIZE * 4:
        return 75
    elif file_size <= TARGET_SIZE * 8:
        return 65
    else:
        return 55  # Very large image, use lower quality

def optimize_image(source_path, target_path, max_attempts=5):
    """Optimize an image to approximately the target size"""
    try:
        # Get original file size
        original_size = os.path.getsize(source_path)
        
        # If file is already smaller than target, just copy it
        if original_size <= TARGET_SIZE:
            shutil.copy2(source_path, target_path)
            print(f"Copied {source_path} (already optimized at {original_size/1024:.1f}KB)")
            return True
        
        # Open the image
        img = Image.open(source_path)
        
        # Convert to RGB if needed (some PNG with transparency)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        
        # Initial quality based on original size
        quality = get_image_quality(original_size)
        
        # Save the image with optimization
        attempt = 0
        while attempt < max_attempts:
            # Create a temporary path for testing
            temp_path = f"{target_path}.temp"
            
            # Save with current quality
            img.save(temp_path, 'JPEG', quality=quality, optimize=True)
            
            # Check new size
            new_size = os.path.getsize(temp_path)
            
            if new_size <= TARGET_SIZE or attempt == max_attempts - 1:
                # Success or last attempt, move to final location
                os.replace(temp_path, target_path)
                print(f"Optimized {source_path}: {original_size/1024:.1f}KB → {new_size/1024:.1f}KB (quality={quality})")
                return True
            
            # Adjust quality for next attempt
            if new_size > TARGET_SIZE * 1.5:
                quality -= 10
            elif new_size > TARGET_SIZE * 1.2:
                quality -= 5
            elif new_size > TARGET_SIZE:
                quality -= 2
            
            quality = max(quality, 40)  # Don't go too low
            
            # Clean up temp file
            os.remove(temp_path)
            attempt += 1
        
        return False
    
    except UnidentifiedImageError:
        print(f"Error: Could not identify image file {source_path}")
        return False
    except Exception as e:
        print(f"Error optimizing {source_path}: {e}")
        return False

def main():
    source_dir = Path("product-images")
    target_dir = Path("product-images-optimized")
    
    # Check if source directory exists
    if not source_dir.exists():
        print(f"Error: Source directory '{source_dir}' not found. Please run download_images.py first.")
        sys.exit(1)
    
    # Create target directory
    ensure_directory(target_dir)
    
    # Count variables for summary
    total_files = 0
    optimized_files = 0
    copied_files = 0
    failed_files = 0
    
    # Process each category directory
    for category_dir in source_dir.iterdir():
        if not category_dir.is_dir():
            continue
        
        # Create corresponding category directory in target
        category_name = category_dir.name
        target_category_dir = target_dir / category_name
        ensure_directory(target_category_dir)
        
        # Process each image in the category
        for image_file in category_dir.iterdir():
            if not image_file.is_file():
                continue
                
            # Skip non-image files
            if not image_file.suffix.lower() in ('.jpg', '.jpeg', '.png', '.gif'):
                continue
                
            total_files += 1
            
            # Create target path
            target_path = target_category_dir / image_file.name
            
            # Change extension to jpg for consistency
            target_path = target_path.with_suffix('.jpg')
            
            # Optimize the image
            if optimize_image(str(image_file), str(target_path)):
                # Check if was copied or optimized
                source_size = os.path.getsize(image_file)
                target_size = os.path.getsize(target_path)
                
                if source_size == target_size:
                    copied_files += 1
                else:
                    optimized_files += 1
            else:
                failed_files += 1
    
    # Print summary
    print("\nOptimization complete!")
    print(f"Total images processed: {total_files}")
    print(f"Images optimized: {optimized_files}")
    print(f"Images copied (already under 800KB): {copied_files}")
    print(f"Failed: {failed_files}")
    print(f"\nOptimized images are stored in: {target_dir}")

if __name__ == "__main__":
    main() 