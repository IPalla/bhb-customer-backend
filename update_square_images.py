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

# Square image data from the response
SQUARE_IMAGES_JSON = """{"objects":[{"type":"IMAGE","id":"XJIDONAFNAELGBIWUWTGV7TQ","updated_at":"2025-02-12T11:45:34.512Z","created_at":"2025-02-12T11:45:34.551Z","version":1739360734512,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"LOGO PRINCIPAL.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/1abfc723eca760b2147a496df994c2e31fb250eb/original.png"}},{"type":"IMAGE","id":"NHOYJMF27YJKPV3IQI63BAE3","updated_at":"2025-03-15T08:03:14.812Z","created_at":"2025-03-15T08:03:14.861Z","version":1742025794812,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"cheese-bacon.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/a9473d7d597bdc897f6d2345ed2ca226806ec88e/original.jpeg"}},{"type":"IMAGE","id":"4VRBTWRQ4CGNQI5K527HJVFC","updated_at":"2025-04-10T10:51:17.593Z","created_at":"2025-04-10T10:51:17.639Z","version":1744282277593,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"starters.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/add61acf726297cb3363b74539c8ba6e70727c9e/original.png"}},{"type":"IMAGE","id":"TAVLRBZFO7H3VMM3HR47OH43","updated_at":"2025-04-10T10:58:34.907Z","created_at":"2025-04-10T10:58:34.944Z","version":1744282714907,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"starters.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/b270e8bfdc8fd3242fdb3d808260cda4df3ae67c/original.png"}},{"type":"IMAGE","id":"QUYHOXRENSPQR2EBB6TAKSOD","updated_at":"2025-04-20T16:56:11.82Z","created_at":"2025-04-20T16:56:11.864Z","version":1745168171820,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"BACON JAM GLOVO_V4 (2).png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/cf44db4eda0fb312af7ba2fa9ab849ef2dbaa638/original.png"}},{"type":"IMAGE","id":"UABALIAGKX3OPQPRNJHU5EHO","updated_at":"2025-04-21T10:01:17.609Z","created_at":"2025-04-21T10:01:17.65Z","version":1745229677609,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"SWEET-SPICY.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/793b2c5ae3f9493d28e49a31a737b9f436dca42b/original.jpeg"}},{"type":"IMAGE","id":"IE3H3KGXVLP65FGT526LKBB7","updated_at":"2025-04-21T10:16:16.428Z","created_at":"2025-04-21T10:16:16.468Z","version":1745230576428,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"PULLPORK EDITADA OK.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/da8bbe7b34bce1e6892296126e24e2a9bf2e03d5/original.jpeg"}},{"type":"IMAGE","id":"ZOBCHP2QGIKIJZ7DSQCC52WT","updated_at":"2025-04-21T10:22:27.978Z","created_at":"2025-04-21T10:22:28.023Z","version":1745230947978,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"CRUNCHY-CHICKEN-BURGER.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/99563ccac633a1ef576135ee27bcf8b7187f3c6f/original.jpeg"}},{"type":"IMAGE","id":"I7JCLCCYILF4K7BJEUOJKCQN","updated_at":"2025-04-21T10:32:10.745Z","created_at":"2025-04-21T10:32:10.779Z","version":1745231530745,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"GLOVO NUTELLA.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/93a2c6b5565f496e5ada6a5aa980ebace25370b6/original.png"}},{"type":"IMAGE","id":"2HE7HBJGQZGRII33MPBVBR6W","updated_at":"2025-04-21T10:33:10.663Z","created_at":"2025-04-21T10:33:10.703Z","version":1745231590663,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"GLOVO OREO.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/d506da3f708dad03892172c4033f782be17fe082/original.png"}},{"type":"IMAGE","id":"2Z5BC2Y4DS6TOEJBZ7IIAZL6","updated_at":"2025-04-21T10:40:16.334Z","created_at":"2025-04-21T10:40:16.375Z","version":1745232016334,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"GLOVO LOTUS (2).png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/15fa5da7a72431a8a8302e466c6d1eb031c4af74/original.png"}},{"type":"IMAGE","id":"C6RP7M5USXKGKPFQKHRIXND6","updated_at":"2025-04-21T10:41:05.562Z","created_at":"2025-04-21T10:41:05.603Z","version":1745232065562,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"GLOVO MARÍA.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/47ccab5444ed937bc4f5e1ee9ad3fc6e93897ce0/original.png"}},{"type":"IMAGE","id":"ZMXUFMYHVUORUY72TRUZOMQF","updated_at":"2025-04-21T10:47:42.991Z","created_at":"2025-04-21T10:47:43.036Z","version":1745232462991,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"Copy of GLOVO PATATAS CON MAS LUZ.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/cc62d73431816f858e004a2b64a154d68b6a7a23/original.png"}},{"type":"IMAGE","id":"V3XRNUJGAUHTIYLAMASILZOG","updated_at":"2025-04-21T10:49:41.122Z","created_at":"2025-04-21T10:49:41.159Z","version":1745232581122,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"TEQUEÑOS_WEB_2.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/eb19fff326ee5d33b62861c4ab2d2dad471b3c38/original.jpeg"}},{"type":"IMAGE","id":"U4X6UZ5YI6CD5TZZGXKF75YC","updated_at":"2025-04-21T10:50:47.317Z","created_at":"2025-04-21T10:50:47.361Z","version":1745232647317,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"ALITAS (1).jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/17ae848ae7750176e0ebad7a235ca4bc5d1508a7/original.jpeg"}},{"type":"IMAGE","id":"PSPXVXZBEOATYGRUS4GK4XNM","updated_at":"2025-04-21T11:15:27.801Z","created_at":"2025-04-21T11:15:27.843Z","version":1745234127801,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"agua_nestle_50cl.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/0dc5275d2d04c94a0746355ed67b4887fed0a533/original.png"}},{"type":"IMAGE","id":"2K37XBCGQ4JOAR6OSVCLR7PU","updated_at":"2025-04-21T11:16:06.546Z","created_at":"2025-04-21T11:16:06.588Z","version":1745234166546,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"aquarius-limon.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/5deb7a44aae602b7c1ecc9cb98b17f4a259f7d68/original.png"}},{"type":"IMAGE","id":"3YHMXZCI3VXSSQWLVOKEVE2I","updated_at":"2025-04-21T11:16:29.613Z","created_at":"2025-04-21T11:16:29.657Z","version":1745234189613,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"aquarius-naranja.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/a205e2bd9566554bf7ffee99cd940c731d2133c1/original.png"}},{"type":"IMAGE","id":"T625CUTLTGW7ANZ5MJROWFYE","updated_at":"2025-04-21T11:17:31.292Z","created_at":"2025-04-21T11:17:31.326Z","version":1745234251292,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"aquarius-limon.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/7804ac7fea1635c0af1dc9ecabd1a75ee7e6f937/original.png"}},{"type":"IMAGE","id":"B2UBVG7SPMOCU5XJTGDBDU4P","updated_at":"2025-04-21T11:17:55.128Z","created_at":"2025-04-21T11:17:55.168Z","version":1745234275128,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"BBQ.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/dbf5d5bac42246b97cd6f3b33419755b947f965e/original.jpeg"}},{"type":"IMAGE","id":"YNAJ6NPBN2GZ5REFV3ZHHYER","updated_at":"2025-04-21T11:18:15.991Z","created_at":"2025-04-21T11:18:16.026Z","version":1745234295991,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"1906.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/617a704f1e1ed5b526f91770f57ffb293b9f8653/original.png"}},{"type":"IMAGE","id":"RAT4MZG6RS7OLX64EE4N5SLT","updated_at":"2025-04-21T11:19:50.015Z","created_at":"2025-04-21T11:19:50.053Z","version":1745234390015,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"estrella-galicia-lata.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/2b3a2f3c8a70619baeff6267ba6562c674dac21b/original.png"}},{"type":"IMAGE","id":"FWRJBU4MUW6BJSP6QSQHI7J6","updated_at":"2025-04-21T11:20:14.327Z","created_at":"2025-04-21T11:20:14.365Z","version":1745234414327,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"coca-cola.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/0d1dc77da30ecb5ab67eb38e64a7c6982e50b1eb/original.png"}},{"type":"IMAGE","id":"F7WWFMP2B7LAD43TB657LXAP","updated_at":"2025-04-21T11:20:29.607Z","created_at":"2025-04-21T11:20:29.649Z","version":1745234429607,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"coca-cola-zero.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/b93c8738335baf848d82b69e326a060ffe5c11b6/original.png"}},{"type":"IMAGE","id":"VJ5TPSYM2KY2ZEV7T2F6MOJG","updated_at":"2025-04-21T11:20:43.328Z","created_at":"2025-04-21T11:20:43.367Z","version":1745234443328,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"coca-cola-zero-zero.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/338c7954fb3f34d6c5fa01226cc2bc7e06e87ae7/original.png"}},{"type":"IMAGE","id":"UHX4PNH2ID7GQH4MEIUSAZV6","updated_at":"2025-04-21T11:21:00.854Z","created_at":"2025-04-21T11:21:00.896Z","version":1745234460854,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"fanta-limon.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/c3daa7fd5a07ec31cca4e73dbe1296d9a856f59f/original.png"}},{"type":"IMAGE","id":"QNZJ3AZ252GU7GRDKNPE3SZH","updated_at":"2025-04-21T11:21:24.272Z","created_at":"2025-04-21T11:21:24.316Z","version":1745234484272,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"fanta-naranja.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/9f0c05b2dad3a35b2926abf3f65e13300d6bbd7b/original.png"}},{"type":"IMAGE","id":"VPM22X7CSI7T2X7VUDZ7DCSS","updated_at":"2025-04-21T11:22:11.622Z","created_at":"2025-04-21T11:22:11.656Z","version":1745234531622,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"holandesa-chipotle.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/d18faa6ef22cebc4f038af3ec2145dae9a222a5a/original.jpeg"}},{"type":"IMAGE","id":"ZSEORF2BKJO2WQJBT23VK6AH","updated_at":"2025-04-21T11:22:42.794Z","created_at":"2025-04-21T11:22:42.833Z","version":1745234562794,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"ketchup-96.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/ad026e030a520d10beb626559393181229d0b908/original.jpeg"}},{"type":"IMAGE","id":"2ROJJCNKB7STV6JTLWRG7ZPZ","updated_at":"2025-04-21T11:22:57.813Z","created_at":"2025-04-21T11:22:57.855Z","version":1745234577813,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"LOTUS CAKE.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/1a95d370cd066f0fbac231e25ecb5a825345334a/original.jpeg"}},{"type":"IMAGE","id":"OODGZTO65EXOHU73BSWIZTEN","updated_at":"2025-04-21T11:23:45.219Z","created_at":"2025-04-21T11:23:45.264Z","version":1745234625219,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"mayonesa-ahumada.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/a3bfd2c82905932b0901febc96a52c2cc0fd6be1/original.jpeg"}},{"type":"IMAGE","id":"4GJV47X3VBTKLVTJWKHKNNFX","updated_at":"2025-04-21T11:24:15.317Z","created_at":"2025-04-21T11:24:15.362Z","version":1745234655317,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"mayonesa-trufa-ahumada.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/5515837a23b221a41bbf26ca79374ccd86fb2833/original.jpeg"}},{"type":"IMAGE","id":"BTRTHBGTNJHEYOHM6PKG3OUQ","updated_at":"2025-04-21T11:24:33.117Z","created_at":"2025-04-21T11:24:33.165Z","version":1745234673117,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"Mojo Rojo.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/af6debae90ef5f4659f2a831816216afd12e4caa/original.jpeg"}},{"type":"IMAGE","id":"7GFL4YQAANLFE7TNKZSSDOC5","updated_at":"2025-04-21T11:24:57.42Z","created_at":"2025-04-21T11:24:57.465Z","version":1745234697420,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"miel mostaza.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/8668022544c9f37bb87ca946cfd9b8a0c3b4174d/original.jpeg"}},{"type":"IMAGE","id":"T5NXAT2ZQU3AIDGKDYTXX7KY","updated_at":"2025-04-21T11:26:14.945Z","created_at":"2025-04-21T11:26:14.996Z","version":1745234774945,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"nestea.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/ffa9f23d38b65e4df42db5173742547d94a67630/original.png"}},{"type":"IMAGE","id":"D2K7RQSX576MUCSXNF5BD524","updated_at":"2025-04-21T11:26:29.03Z","created_at":"2025-04-21T11:26:29.069Z","version":1745234789030,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"OREO CAKE.jpg","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/8c4df706a6a624e1ba17655b8d8edd031c1c0078/original.jpeg"}},{"type":"IMAGE","id":"S6GUPWLH377AK6B5CTK4VUKG","updated_at":"2025-04-21T11:27:03.41Z","created_at":"2025-04-21T11:27:03.445Z","version":1745234823410,"is_deleted":false,"present_at_all_locations":true,"image_data":{"name":"sprite.png","url":"https://items-images-production.s3.us-west-2.amazonaws.com/files/cae2b80196043effb460d9bd7fa7869c034a64d0/original.png"}}]}"""

def clean_filename(name):
    """Convert a display name to a filename format (lowercase, spaces to dashes)"""
    name = name.lower().replace(' ', '-')
    # Remove special characters
    name = re.sub(r'[^\w\-\.]', '', name)
    # Ensure .jpg extension for all images
    if not name.endswith('.jpg'):
        name = name.split('.')[0] + '.jpg'
    return name

def create_image_map():
    """Create a mapping of clean filenames to Square image IDs"""
    image_map = {}
    
    # Parse Square images JSON
    square_images = json.loads(SQUARE_IMAGES_JSON)
    
    for image in square_images.get('objects', []):
        if image.get('type') == 'IMAGE' and 'image_data' in image and 'name' in image['image_data']:
            image_id = image.get('id')
            original_name = image['image_data']['name']
            filename = clean_filename(original_name)
            image_map[filename] = {
                'id': image_id,
                'name': original_name
            }
    
    return image_map

def find_optimized_image(image_map, optimized_dir):
    """Find all optimized images and match them with Square IDs"""
    matched_images = []
    unmatched_images = []
    
    # Walk through all directories in optimized_images
    for root, _, files in os.walk(optimized_dir):
        for file in files:
            if file.endswith('.jpg'):
                # Construct the full path
                file_path = os.path.join(root, file)
                
                # Check if this file matches any Square image
                if file in image_map:
                    matched_images.append({
                        'path': file_path,
                        'id': image_map[file]['id'],
                        'name': image_map[file]['name']
                    })
                else:
                    unmatched_images.append(file_path)
    
    return matched_images, unmatched_images

def update_square_image(image_info):
    """Update a Square image using curl command"""
    image_id = image_info['id']
    image_path = image_info['path']
    image_name = image_info['name']
    
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
            print(f"✅ Successfully updated image: {image_name} (ID: {image_id})")
            return True
        else:
            print(f"❌ Failed to update image: {image_name} (ID: {image_id})")
            print(f"Error: {result.stderr or result.stdout}")
            return False
    except Exception as e:
        print(f"❌ Exception updating image {image_name}: {str(e)}")
        return False

def main():
    # Check if optimized images directory exists
    if not os.path.exists(OPTIMIZED_IMAGES_DIR):
        print(f"Error: Directory '{OPTIMIZED_IMAGES_DIR}' not found.")
        print("Please run download_images.py and optimize_images.py first.")
        return
    
    print(f"Creating mapping of Square catalog images...")
    image_map = create_image_map()
    print(f"Found {len(image_map)} images in Square catalog.")
    
    print(f"\nSearching for optimized images in {OPTIMIZED_IMAGES_DIR}...")
    matched_images, unmatched_images = find_optimized_image(image_map, OPTIMIZED_IMAGES_DIR)
    
    print(f"Found {len(matched_images)} matching images to update.")
    print(f"Found {len(unmatched_images)} images without a match in Square catalog.")
    
    if not matched_images:
        print("No images to update. Exiting.")
        return
    
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
        print(f"\nWARNING: {len(unmatched_images)} optimized images did not match any Square catalog image.")
        print("These images were not uploaded:")
        for path in unmatched_images[:5]:
            print(f"  - {path}")
        if len(unmatched_images) > 5:
            print(f"  - ... and {len(unmatched_images) - 5} more")

if __name__ == "__main__":
    main() 