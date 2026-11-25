"""Regenerate the Longbing launcher and splash PNGs with Pillow."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MASTERS = ROOT / "resources"
RES = ROOT / "android/app/src/main/res"
NAVY = "#0C2138"
MINT = "#6DE3CA"
PALE = "#E0F9F5"
LANCZOS = Image.Resampling.LANCZOS


def curve(start, control_a, control_b, end):
    """Sample a cubic Bézier in the common 1024px icon coordinate space."""
    points = []
    for step in range(1, 25):
        t = step / 24
        u = 1 - t
        points.append(tuple(
            round(u**3 * start[i] + 3 * u**2 * t * control_a[i]
                  + 3 * u * t**2 * control_b[i] + t**3 * end[i])
            for i in (0, 1)
        ))
    return points


def stroke(draw, points, color, width):
    draw.line(points, fill=color, width=width, joint="curve")
    radius = width / 2
    for x, y in (points[0], points[-1]):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)


def book_mark():
    image = Image.new("RGBA", (1024, 1024))
    draw = ImageDraw.Draw(image)

    # The outlines share a spine. The whole mark fits Android's 66dp safe circle.
    spine_top, spine_bottom = (512, 432), (512, 665)
    left_top, left_bottom = (290, 380), (290, 622)
    right_top, right_bottom = (734, 380), (734, 622)
    left = [spine_top] + curve(spine_top, (461, 393), (376, 365), left_top)
    left += [left_bottom] + curve(left_bottom, (376, 610), (461, 632), spine_bottom)
    right = [spine_top] + curve(spine_top, (563, 393), (648, 365), right_top)
    right += [right_bottom] + curve(right_bottom, (648, 610), (563, 632), spine_bottom)
    stroke(draw, left, PALE, 40)
    stroke(draw, [spine_top, spine_bottom], PALE, 40)
    stroke(draw, right, MINT, 40)

    stroke(draw, [(350, 470), (425, 482)], PALE, 24)
    stroke(draw, [(350, 530), (400, 537)], PALE, 24)
    stroke(draw, [(573, 521), (609, 555), (668, 484)], MINT, 30)
    return image


def gradient(size, center, edge):
    radial = Image.radial_gradient("L").resize(size, LANCZOS)
    return ImageOps.colorize(radial, center, edge)


def launcher(foreground, circular=False):
    background = gradient((1024, 1024), "#153951", NAVY).convert("RGBA")
    draw = ImageDraw.Draw(background)
    border = (49, 49, 975, 975)
    if circular:
        draw.ellipse(border, outline="#235365", width=5)
    else:
        draw.rounded_rectangle(border, radius=218, outline="#235365", width=5)
    image = Image.alpha_composite(background, foreground)
    mask = Image.new("L", image.size)
    shape = ImageDraw.Draw(mask)
    if circular:
        shape.ellipse((2, 2, 1021, 1021), fill=255)
    else:
        shape.rounded_rectangle((2, 2, 1021, 1021), radius=244, fill=255)
    image.putalpha(mask)
    return image


def save_png(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def main():
    foreground = book_mark()
    square_icon = launcher(foreground)
    round_icon = launcher(foreground, circular=True)
    save_png(square_icon, MASTERS / "icon.png")

    canvas = (2732, 2732)
    splash = gradient(canvas, "#173B53", NAVY)
    tile = square_icon.resize((712, 712), LANCZOS)
    splash.paste(tile, ((canvas[0] - tile.width) // 2, (canvas[1] - tile.height) // 2), tile)
    save_png(splash, MASTERS / "splash.png")

    for density, icon_size, foreground_size in (
        ("mdpi", 48, 108), ("hdpi", 72, 162), ("xhdpi", 96, 216),
        ("xxhdpi", 144, 324), ("xxxhdpi", 192, 432),
    ):
        directory = RES / f"mipmap-{density}"
        for name, source, size in (
            ("ic_launcher", square_icon, icon_size),
            ("ic_launcher_round", round_icon, icon_size),
            ("ic_launcher_foreground", foreground, foreground_size),
        ):
            save_png(source.resize((size, size), LANCZOS), directory / f"{name}.png")

    for density, short, long in (
        ("mdpi", 320, 480), ("hdpi", 480, 800), ("xhdpi", 720, 1280),
        ("xxhdpi", 960, 1600), ("xxxhdpi", 1280, 1920),
    ):
        save_png(ImageOps.fit(splash, (short, long), LANCZOS), RES / f"drawable-port-{density}/splash.png")
        save_png(ImageOps.fit(splash, (long, short), LANCZOS), RES / f"drawable-land-{density}/splash.png")
    save_png(ImageOps.fit(splash, (480, 320), LANCZOS), RES / "drawable/splash.png")


if __name__ == "__main__":
    main()
