#!/bin/bash

# Directory containing blog images
BLOG_IMAGES_DIR="public/images/blog"

# Check if directory exists
if [ ! -d "$BLOG_IMAGES_DIR" ]; then
    echo "Directory $BLOG_IMAGES_DIR does not exist."
    exit 1
fi

# Check if sharp-cli is installed (globally or locally via npx)
if ! command -v npx &> /dev/null; then
    echo "npx is not installed. Please install Node.js."
    exit 1
fi

echo "Optimizing images in $BLOG_IMAGES_DIR..."

# Loop through images
find "$BLOG_IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read img; do
    echo "Processing $img..."
    
    # Create webp version
    filename=$(basename -- "$img")
    extension="${filename##*.}"
    filename="${filename%.*}"
    
    npx sharp-cli -i "$img" -o "$BLOG_IMAGES_DIR/$filename.webp" --quality 80 --width 1200 --withoutEnlargement
    
    echo "Created $BLOG_IMAGES_DIR/$filename.webp"
done

echo "Image optimization complete."
