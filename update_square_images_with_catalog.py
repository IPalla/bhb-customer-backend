import os
import json
import uuid
import subprocess
from pathlib import Path
import re

# Constants
SQUARE_BEARER_TOKEN = "EAAAFKV2Eh8XlF3RSoNuzAZB-CZ4n6QzoSW2MJ6OqG2JZhemC-xVRqV4YO_DhBnj"
BASE_URL = "https://connect.squareup.com/v2/catalog/images/"
OPTIMIZED_IMAGES_DIR = "product-images-optimized"

# Function to clean product names to match filenames
def clean_filename(name):
    """Convert a display name to a filename format (lowercase, spaces to dashes)"""
    name = name.lower().replace(' ', '-')
    # Remove special characters
    name = re.sub(r'[^\w\-\.]', '', name)
    # Ensure .jpg extension for all images
    if not (name.endswith('.jpg') or name.endswith('.jpeg') or name.endswith('.png')):
        # For filenames without an extension, preserve the original extension if it exists
        if '.' in name:
            name = name.split('.')[0] + '.jpg'  # Default to .jpg if unknown extension
        else:
            name = name + '.jpg'  # Add .jpg if no extension
    return name

def load_catalog_data():
    """Load catalog data from Square API or from a file"""
    catalog_file = 'catalog_data.json'
    
    # Check if we need to fetch from API
    fetch_from_api = input("Do you want to fetch the latest catalog data from Square API? (y/n): ").lower() == 'y'
    
    if fetch_from_api:
        print("Fetching catalog data from Square API...")
        try:
            # Fetch catalog data using curl
            curl_command = [
                'curl', '--location', '--request', 'GET', 
                'https://connect.squareup.com/v2/catalog/list?types=ITEM,IMAGE',
                '--header', 'Accept: application/json',
                '--header', f'Authorization: Bearer {SQUARE_BEARER_TOKEN}',
                '--header', 'Content-Type: application/json'
            ]
            
            result = subprocess.run(curl_command, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Error fetching catalog data: {result.stderr}")
                return None
            
            # Save the response to file
            with open(catalog_file, 'w') as f:
                f.write(result.stdout)
            
            return json.loads(result.stdout)
        except Exception as e:
            print(f"Error fetching catalog data: {str(e)}")
            return None
    
    # Try to load from file
    if os.path.exists(catalog_file):
        print(f"Loading catalog data from {catalog_file}...")
        with open(catalog_file, 'r') as f:
            return json.load(f)
    
    # If no option worked, create a manual file
    print("Creating catalog data from sample...")
    return create_sample_catalog()

def create_sample_catalog():
    """Create a sample catalog file with full data"""
    catalog_file = 'catalog_data.json'
    
    print("Please paste the complete catalog data from Square into 'catalog_data.json'")
    print("Then press Enter to continue...")
    input()
    
    if os.path.exists(catalog_file):
        with open(catalog_file, 'r') as f:
            return json.load(f)
    
    print("No catalog data found. Using a minimal sample.")
    # Create a minimal sample
    catalog_data = {
        "objects": []
    }
    
    # Write to file for future use
    with open(catalog_file, 'w') as f:
        json.dump(catalog_data, f, indent=2)
    
    return catalog_data

def create_product_image_mapping(catalog_data):
    """Create mapping of product names to their image IDs"""
    product_image_map = {}
    image_info = {}
    
    # Extract all images first
    for item in catalog_data.get('objects', []):
        if item.get('type') == 'IMAGE' and 'image_data' in item:
            image_info[item.get('id')] = {
                'name': item['image_data'].get('name', ''),
                'url': item['image_data'].get('url', '')
            }
    
    # Map products to their images
    for item in catalog_data.get('objects', []):
        if item.get('type') == 'ITEM' and 'item_data' in item:
            product_name = item['item_data'].get('name', '')
            image_ids = item['item_data'].get('image_ids', [])
            
            if product_name and image_ids:
                # In case a product has multiple images, use the first one
                image_id = image_ids[0]
                if image_id in image_info:
                    product_image_map[product_name] = {
                        'image_id': image_id,
                        'image_name': image_info[image_id]['name'],
                        'image_url': image_info[image_id]['url']
                    }
    
    return product_image_map

def create_reverse_image_mapping(catalog_data):
    """Create mapping from image IDs directly to image data"""
    image_map = {}
    
    for item in catalog_data.get('objects', []):
        if item.get('type') == 'IMAGE' and 'image_data' in item:
            image_id = item.get('id')
            image_name = item['image_data'].get('name', '')
            image_map[image_id] = {
                'id': image_id,
                'name': image_name,
                'url': item['image_data'].get('url', '')
            }
    
    return image_map

def find_optimized_images(product_image_map, image_map, optimized_dir):
    """Find all optimized images and match them with Square product info"""
    matched_images = []
    unmatched_images = []
    
    # Track all image files
    all_image_files = []
    
    # Walk through all directories in optimized_images
    for root, _, files in os.walk(optimized_dir):
        for file in files:
            if file.endswith('.jpg') or file.endswith('.jpeg') or file.endswith('.png'):
                # Construct the full path
                file_path = os.path.join(root, file)
                all_image_files.append(file_path)
                
                # Get base name and name without extension for matching
                base_name = os.path.basename(file)
                name_without_ext = os.path.splitext(base_name)[0]
                
                # Try to find matching product - first by product name
                found_match = False
                for product_name, image_data in product_image_map.items():
                    product_filename = clean_filename(product_name)
                    product_name_without_ext = os.path.splitext(product_filename)[0]
                    
                    # Match by full name with extension or by name without extension
                    if (file == product_filename or 
                        name_without_ext == product_name_without_ext):
                        matched_images.append({
                            'path': file_path,
                            'product_name': product_name,
                            'image_id': image_data['image_id'],
                            'image_name': image_data['image_name']
                        })
                        found_match = True
                        break
                
                if not found_match:
                    # Try to match by image name
                    for image_id, image_data in image_map.items():
                        image_name = image_data['name']
                        clean_image_name = clean_filename(image_name)
                        image_name_without_ext = os.path.splitext(clean_image_name)[0]
                        
                        # Match by full name with extension or by name without extension
                        if (base_name == clean_image_name or 
                            name_without_ext == image_name_without_ext):
                            matched_images.append({
                                'path': file_path,
                                'product_name': 'Unknown',  # No product mapping
                                'image_id': image_id,
                                'image_name': image_name
                            })
                            found_match = True
                            break
                
                if not found_match:
                    unmatched_images.append(file_path)
    
    return matched_images, unmatched_images, all_image_files

def update_square_image(image_info):
    """Update a Square image using curl command"""
    image_id = image_info['image_id']
    image_path = image_info['path']
    image_name = image_info['image_name']
    
    # Generate a random UUID for idempotency key
    idempotency_key = str(uuid.uuid4())
    
    # Construct the curl command
    curl_command = [
        'curl', '--location', '--request', 'PUT', 
        f'{BASE_URL}{image_id}',
        '--header', 'Accept: application/json',
        '--header', f'Authorization: Bearer {SQUARE_BEARER_TOKEN}',
        '--header', 'Cache-Control: no-cache',
        '--form', f'file=@"{image_path}"',
        '--form', f'request={{"idempotency_key":"{idempotency_key}","object_id":"{image_id}","image":{{"type":"IMAGE","image_data":{{"caption":"{image_name}"}}}}}}',
    ]
    
    # Execute the curl command
    try:
        result = subprocess.run(curl_command, capture_output=True, text=True)
        
        # Check if the request was successful
        if result.returncode == 0 and '"errors":' not in result.stdout:
            product_info = f"{image_info['product_name']} " if image_info['product_name'] != 'Unknown' else ""
            print(f"✅ Successfully updated image for: {product_info}(ID: {image_id}, File: {os.path.basename(image_path)})")
            return True
        else:
            print(f"❌ Failed to update image for: {image_info['product_name']} (ID: {image_id})")
            print(f"Error: {result.stderr or result.stdout}")
            return False
    except Exception as e:
        print(f"❌ Exception updating image: {str(e)}")
        return False

def main():
    # Check if optimized images directory exists
    if not os.path.exists(OPTIMIZED_IMAGES_DIR):
        print(f"Error: Directory '{OPTIMIZED_IMAGES_DIR}' not found.")
        print("Please run download_images.py and optimize_images.py first.")
        return
    
    # Load catalog data
    catalog_data = load_catalog_data()
    if not catalog_data:
        print("Failed to load catalog data. Please check your configuration.")
        return
    
    # Create product-image mapping
    print("Creating product-image mapping...")
    product_image_map = create_product_image_mapping(catalog_data)
    print(f"Found {len(product_image_map)} products with images in catalog.")
    
    # Create direct image mapping
    image_map = create_reverse_image_mapping(catalog_data)
    print(f"Found {len(image_map)} total images in catalog.")
    
    # Find optimized images
    print(f"\nSearching for optimized images in {OPTIMIZED_IMAGES_DIR}...")
    matched_images, unmatched_images, all_image_files = find_optimized_images(product_image_map, image_map, OPTIMIZED_IMAGES_DIR)
    
    # Count images by extension
    jpg_count = sum(1 for file in all_image_files if file.lower().endswith('.jpg') or file.lower().endswith('.jpeg'))
    png_count = sum(1 for file in all_image_files if file.lower().endswith('.png'))
    other_count = len(all_image_files) - jpg_count - png_count
    
    print(f"Found {len(all_image_files)} total image files:")
    print(f"  - JPG/JPEG: {jpg_count}")
    print(f"  - PNG: {png_count}")
    if other_count > 0:
        print(f"  - Other: {other_count}")
    print(f"Found {len(matched_images)} matching optimized images to update.")
    print(f"Found {len(unmatched_images)} images without a match.")
    
    if not matched_images:
        print("No images to update. Exiting.")
        return
    
    # Handle unmatched images
    if unmatched_images and len(unmatched_images) > 0:
        print("\nUnmatched images found. Options:")
        print("1. Continue with matched images only")
        print("2. Try to match by filename only (might upload wrong images)")
        print("3. Exit and fix matching issues")
        
        choice = input("Enter your choice (1-3): ")
        
        if choice == "3":
            print("Exiting. Please check your image filenames and catalog data.")
            return
        elif choice == "2":
            print("Attempting to match by filename...")
            # Ask for confirmation as this is risky
            confirm_risky = input("This might upload images to the wrong products. Continue? (y/n): ")
            if confirm_risky.lower() != 'y':
                print("Cancelled. Exiting.")
                return
            
            # List image IDs to choose from
            print("\nAvailable image IDs:")
            for i, (image_id, data) in enumerate(image_map.items(), 1):
                print(f"{i}. ID: {image_id} - Name: {data['name']}")
            
            # Let user manually select image ID for each unmatched image
            for unmatched_path in unmatched_images[:]:
                base_name = os.path.basename(unmatched_path)
                print(f"\nUnmatched image: {base_name}")
                image_id = input("Enter image ID to use (or 'skip' to ignore): ")
                
                if image_id.lower() == 'skip':
                    continue
                
                if image_id in image_map:
                    matched_images.append({
                        'path': unmatched_path,
                        'product_name': 'Manually matched',
                        'image_id': image_id,
                        'image_name': image_map[image_id]['name']
                    })
                    unmatched_images.remove(unmatched_path)
                else:
                    print(f"Invalid image ID: {image_id}. Skipping.")
    
    # Ask for confirmation before updating
    confirm = input(f"\nReady to update {len(matched_images)} images in Square catalog. Continue? (y/n): ")
    if confirm.lower() != 'y':
        print("Update cancelled.")
        return
    
    # Update images
    print("\nUpdating images...")
    successful = 0
    failed = 0
    
    for image_info in matched_images:
        if update_square_image(image_info):
            successful += 1
        else:
            failed += 1
    
    # Print summary
    print("\nUpdate complete!")
    print(f"Total images processed: {len(matched_images)}")
    print(f"Successfully updated: {successful}")
    print(f"Failed: {failed}")
    
    if unmatched_images:
        print(f"\nWARNING: {len(unmatched_images)} optimized images did not match any catalog image.")
        print("These images were not uploaded:")
        for path in unmatched_images[:5]:
            print(f"  - {os.path.basename(path)}")
        if len(unmatched_images) > 5:
            print(f"  - ... and {len(unmatched_images) - 5} more")

if __name__ == "__main__":
    main() 