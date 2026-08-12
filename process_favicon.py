from PIL import Image, ImageDraw

def process_favicon(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Flood fill the background from the top-left corner
    # We use a magic color (magenta) to identify the background
    temp_img = img.convert("RGB")
    ImageDraw.floodfill(temp_img, (0, 0), (255, 0, 255), thresh=40)
    
    # Convert magenta pixels to transparent
    datas = temp_img.getdata()
    original_datas = img.getdata()
    
    newData = []
    for i, item in enumerate(datas):
        if item == (255, 0, 255):
            newData.append((255, 255, 255, 0))
        else:
            newData.append(original_datas[i])
            
    img.putdata(newData)
    
    # Crop the image to its bounding box to remove excess transparency (makes it "bigger")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Make it a square so it doesn't get distorted when used as a favicon
    max_dim = max(img.size)
    square_img = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 0))
    
    offset_x = (max_dim - img.size[0]) // 2
    offset_y = (max_dim - img.size[1]) // 2
    
    square_img.paste(img, (offset_x, offset_y))
    
    square_img.save(output_path, "PNG")
    print("Favicon processed successfully.")

if __name__ == "__main__":
    import sys
    process_favicon(sys.argv[1], sys.argv[2])
