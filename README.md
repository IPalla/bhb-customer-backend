# Product Images Downloader

A simple Python script to download all product images from the restaurant menu and organize them by category.

## Requirements

- Python 3.6+
- Internet connection

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Make sure your `dist/menu.json` file is in the correct location.

## Usage

### 1. Download Original Images

Run the script to download the original images:

```bash
python download_images.py
```

This will download all product images to the `product-images` directory.

### 2. Optimize Images

After downloading, you can optimize the images to a target size of 800KB:

```bash
python optimize_images.py
```

This will:
- Process all downloaded images from `product-images`
- Optimize them to approximately 800KB
- Save the optimized versions to `product-images-optimized`
- Maintain the same directory structure and naming conventions

### 3. Update Images in Square Catalog

Finally, you can upload the optimized images to your Square catalog. There are two ways to do this:

#### Method 1: Using only image IDs

```bash
python update_square_images.py
```

This method matches images by their name with those in the Square catalog.

#### Method 2: Using product-image relationships (Recommended)

```bash
python update_square_images_with_catalog.py
```

This method:
- Uses the Square catalog data to find the correct image ID for each product
- Matches optimized images to products by name
- Ensures images are uploaded to the correct products
- Provides better matching accuracy

## Output

The scripts will:

1. Create directories for your images:
   - `product-images` for the original downloaded images
   - `product-images-optimized` for the optimized versions
2. Create subdirectories for each product category (e.g., `burgers/`, `drinks/`, etc.)
3. Download and optimize all product images with filenames based on the product name (lowercase with hyphens)
4. Print progress information and a summary when complete
5. Update the optimized images in your Square catalog

## Run local postgres database

```bash
$ docker run -d --name myPostgresDb -p 5455:5432 \
  -e POSTGRES_USER=myUser -e POSTGRES_PASSWORD=myPassword postgres
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Export database
```bash
PGPASSWORD=<password> pg_dump "postgresql://bite-admin@34.116.213.106:5432/bhb-operations-postgresql" -F c -b -v -f <backup_file_name>.dump
```

# Square Image Management

This project provides utilities for managing product images for a Square catalog.

## Requirements

- Python 3.6+
- pip (Python package manager)

## Setup

1. Clone or download this repository
2. Install the required dependencies:

```
pip install -r requirements.txt
```

## Scripts

### 1. Download Images (`download_images.py`)

Downloads product images from the menu.json file and organizes them into folders.

**Usage:**
```
python download_images.py
```

**What it does:**
- Loads menu data from `dist/menu.json`
- Creates directory structure under `product-images/` with category subfolders
- Downloads images for each product, naming them with cleaned product names
- Handles errors gracefully and reports download status

### 2. Optimize Images (`optimize_images.py`)

Optimizes the downloaded images to a target size of 800 KB.

**Usage:**
```
python optimize_images.py
```

**What it does:**
- Processes images from the `product-images/` directory
- Creates optimized versions in `product-images-optimized/` with the same folder structure
- Adjusts image quality to target a file size of 800 KB
- Provides progress tracking and status reporting

### 3. Update Square Catalog Images (`update_square_images_with_catalog.py`)

Updates images in the Square catalog with the optimized versions.

**Usage:**
```
python update_square_images_with_catalog.py
```

**What it does:**
- Loads complete catalog data from Square API or a local file
- Creates a mapping between products and their image IDs
- Finds matching optimized images based on product names and image names
- Updates each image in the Square catalog using the API
- Provides options for handling unmatched images
- Reports on update success/failure

**Features:**
- Interactive catalog data loading from API or file
- Matching by both product name and image name for better coverage
- Manual matching option for remaining unmatched images
- Detailed progress and error reporting

## Workflow

For a complete image update workflow:

1. Run `download_images.py` to download all product images
2. Run `optimize_images.py` to create optimized versions
3. Run `update_square_images_with_catalog.py` to update the Square catalog

## Notes

- The Square API token is included in the scripts but may need to be updated if expired
- The script will handle image matching automatically in most cases
- If unmatched images remain, you can choose to match them manually or skip them
- All operations provide status reports for tracking progress
