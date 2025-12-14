#!/bin/bash
# Image Compression Script for LC Website
# This script compresses all images in public/images using ImageMagick

set -e

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Installing via Homebrew..."
    brew install imagemagick
fi

# Use the correct command (newer versions use 'magick', older use 'convert')
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

IMAGES_DIR="public/images"
BACKUP_DIR="public/images_backup"

# Create backup
echo "📦 Creating backup of original images..."
if [ -d "$BACKUP_DIR" ]; then
    echo "⚠️  Backup directory already exists. Skipping backup."
else
    cp -r "$IMAGES_DIR" "$BACKUP_DIR"
    echo "✅ Backup created at $BACKUP_DIR"
fi

# Count files
total_files=$(find "$IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l | tr -d ' ')
processed=0

echo ""
echo "🔧 Compressing $total_files images..."
echo ""

# Calculate initial size
initial_size=$(du -sh "$IMAGES_DIR" | cut -f1)

# Process JPG/JPEG files
find "$IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
    # Compress to 85% quality, strip metadata, resize if larger than 1920px
    $CONVERT_CMD "$file" -strip -quality 85 -resize "1920x1920>" "$file"
    ((processed++)) || true
    filename=$(basename "$file")
    echo "  ✓ Compressed: $filename"
done

# Process PNG files (convert large ones to JPG, keep small ones as optimized PNG)
find "$IMAGES_DIR" -type f -name "*.png" | while read file; do
    filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    filename=$(basename "$file")
    
    # If PNG is larger than 500KB and not a logo, convert to JPG
    if [ "$filesize" -gt 500000 ] && [[ ! "$filename" =~ [Ll]ogo ]]; then
        # Create JPG version
        jpg_file="${file%.png}.jpg"
        $CONVERT_CMD "$file" -strip -quality 85 -resize "1920x1920>" "$jpg_file"
        # Remove the original PNG
        rm "$file"
        echo "  ✓ Converted to JPG: $filename"
    else
        # Keep as PNG but optimize
        $CONVERT_CMD "$file" -strip "$file"
        echo "  ✓ Optimized PNG: $filename"
    fi
done

# Calculate final size
final_size=$(du -sh "$IMAGES_DIR" | cut -f1)

echo ""
echo "════════════════════════════════════════"
echo "✅ Compression Complete!"
echo "════════════════════════════════════════"
echo "📊 Before: $initial_size"
echo "📊 After:  $final_size"
echo ""
echo "💡 Original images backed up to: $BACKUP_DIR"
echo "   (You can delete this folder once satisfied)"
echo ""
