from PIL import Image
import sys

def remove_background(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        # Assume the top-left pixel is the background color
        bg_color = datas[0]
        
        newData = []
        for item in datas:
            # check if pixel is close to bg_color
            if abs(item[0] - bg_color[0]) < tolerance and \
               abs(item[1] - bg_color[1]) < tolerance and \
               abs(item[2] - bg_color[2]) < tolerance:
                # set transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Background removed successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_background("favicon.png", "favicon.png", tolerance=50)
