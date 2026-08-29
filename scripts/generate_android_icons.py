import os
from PIL import Image, ImageOps, ImageDraw

def generate_icons():
    src_logo = "public/assets/logos/logo-square.png"
    if not os.path.exists(src_logo):
        print(f"Error: {src_logo} not found")
        return

    img = Image.open(src_logo).convert("RGBA")
    
    # Mipmap launcher icon sizes
    sizes = {
        "mipmap-mdpi": (48, 48, 108),
        "mipmap-hdpi": (72, 72, 162),
        "mipmap-xhdpi": (96, 96, 216),
        "mipmap-xxhdpi": (144, 144, 324),
        "mipmap-xxxhdpi": (192, 192, 432)
    }

    base_res = "android/app/src/main/res"

    for folder, (ic_size, round_size, fg_size) in sizes.items():
        folder_path = os.path.join(base_res, folder)
        os.makedirs(folder_path, exist_ok=True)

        # 1. ic_launcher.png (Square / standard with subtle padding on white/transparent background)
        launcher_img = Image.new("RGBA", (ic_size, ic_size), (0, 0, 0, 0))
        scaled_logo = img.resize((ic_size, ic_size), Image.Resampling.LANCZOS)
        launcher_img.paste(scaled_logo, (0, 0), scaled_logo)
        launcher_img.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # 2. ic_launcher_round.png (Circular mask)
        round_canvas = Image.new("RGBA", (round_size, round_size), (0, 0, 0, 0))
        mask = Image.new("L", (round_size, round_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, round_size, round_size), fill=255)
        
        scaled_round = img.resize((round_size, round_size), Image.Resampling.LANCZOS)
        round_canvas.paste(scaled_round, (0, 0))
        round_canvas.putalpha(mask)
        round_canvas.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # 3. ic_launcher_foreground.png (Adaptive icon foreground: 108dp canvas with 66-72dp centered icon)
        fg_canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        # Center logo taking ~66% of fg canvas to respect adaptive icon safe zone
        icon_dim = int(fg_size * 0.66)
        scaled_fg_logo = img.resize((icon_dim, icon_dim), Image.Resampling.LANCZOS)
        offset = (fg_size - icon_dim) // 2
        fg_canvas.paste(scaled_fg_logo, (offset, offset), scaled_fg_logo)
        fg_canvas.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated icons for {folder}: {ic_size}x{ic_size}, fg {fg_size}x{fg_size}")

    # Generate Splash screens with centered emblem on white background
    splash_sizes = {
        "drawable": (480, 800),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
    }

    for folder, (w, h) in splash_sizes.items():
        folder_path = os.path.join(base_res, folder)
        os.makedirs(folder_path, exist_ok=True)

        splash_canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
        # Determine center logo size (about 30-40% of smaller dimension)
        min_dim = min(w, h)
        logo_dim = int(min_dim * 0.38)
        scaled_splash_logo = img.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        splash_canvas.paste(scaled_splash_logo, pos, scaled_splash_logo)
        splash_canvas.save(os.path.join(folder_path, "splash.png"), "PNG")
        print(f"Generated splash for {folder}: {w}x{h}")

    print("All Android launcher icons and splash screens successfully generated from SahyogSeva brand logo!")

if __name__ == "__main__":
    generate_icons()
