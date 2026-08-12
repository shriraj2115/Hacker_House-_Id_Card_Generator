from PIL import Image

def enlarge_favicon(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Make it a tight square for favicon to prevent distortion
    max_dim = max(img.size)
    square_img = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 0))
    
    offset_x = (max_dim - img.size[0]) // 2
    offset_y = (max_dim - img.size[1]) // 2
    
    square_img.paste(img, (offset_x, offset_y))
    square_img.save(output_path, "PNG")
    print("Favicon cropped and enlarged successfully.")

if __name__ == "__main__":
    import sys
    enlarge_favicon(sys.argv[1], sys.argv[2])
