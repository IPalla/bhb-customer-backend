import json
import os
import requests
import re
from pathlib import Path

# Load the menu data
def load_menu():
    with open('dist/menu.json', 'r') as file:
        return json.load(file)

# Clean the filename
def clean_filename(name):
    # Convert to lowercase and replace spaces with hyphens
    name = name.lower().replace(' ', '-')
    # Remove any special characters that might cause issues in filenames
    name = re.sub(r'[^\w\-\.]', '', name)
    return name

# Create necessary directories
def create_directories(categories):
    base_dir = Path('product-images')
    base_dir.mkdir(exist_ok=True)
    
    for category in categories:
        category_dir = base_dir / clean_filename(category)
        category_dir.mkdir(exist_ok=True)
    
    return base_dir

# Download image
def download_image(url, filepath):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"Downloaded: {filepath}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    print("Starting download of product images...")
    
    # Load menu
    menu = load_menu()
    
    # Get unique categories
    categories = set()
    for item in menu:
        if 'category' in item and 'name' in item['category']:
            categories.add(item['category']['name'])
    
    # Create directories
    base_dir = create_directories(categories)
    
    # Download images
    downloaded_count = 0
    failed_count = 0
    
    for item in menu:
        if 'category' not in item or 'name' not in item['category'] or 'images' not in item:
            continue
        
        category_name = item['category']['name']
        product_name = item['name']
        
        category_dir = base_dir / clean_filename(category_name)
        
        for image in item['images']:
            if 'url' not in image:
                continue
            
            image_url = image['url']
            # Get file extension from URL
            file_extension = os.path.splitext(image_url)[1]
            if not file_extension:
                file_extension = '.jpg'  # Default extension if none is found
            
            # Create filename
            filename = clean_filename(product_name) + file_extension
            filepath = category_dir / filename
            
            # Download the image
            success = download_image(image_url, filepath)
            if success:
                downloaded_count += 1
            else:
                failed_count += 1
    
    print(f"\nDownload complete!")
    print(f"Total images downloaded: {downloaded_count}")
    print(f"Failed downloads: {failed_count}")

if __name__ == "__main__":
    main() 