from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "images"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH = 1600
HEIGHT = 1000

NAVY = (3, 12, 28)
NAVY_2 = (7, 24, 48)
NAVY_3 = (14, 38, 70)
PAPER = (248, 250, 252)
MUTED = (203, 213, 225)
GOLD = (214, 172, 86)
GOLD_LIGHT = (246, 219, 153)
GREEN = (46, 160, 112)
BLUE = (62, 126, 215)
RED = (185, 72, 72)


def font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


F12 = font(24)
F14 = font(30)
F16 = font(34)
F18 = font(38)
F22 = font(46)
F28 = font(58, True)
F36 = font(74, True)
F48 = font(96, True)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadow_card(base, box, radius=28, fill=(255, 255, 255), outline=(226, 232, 240), shadow=(0, 0, 0, 70)):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    offset = 18
    d.rounded_rectangle((box[0] + offset, box[1] + offset, box[2] + offset, box[3] + offset), radius=radius, fill=shadow)
    layer = layer.filter(ImageFilter.GaussianBlur(20))
    base.alpha_composite(layer)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def gradient_bg(top=NAVY, bottom=(11, 18, 32)):
    img = Image.new("RGBA", (WIDTH, HEIGHT), top + (255,))
    pix = img.load()
    for y in range(HEIGHT):
        t = y / (HEIGHT - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(WIDTH):
            glow = max(0, 1 - (((x - 330) / 720) ** 2 + ((y - 120) / 560) ** 2))
            rr = min(255, int(r + glow * 28))
            gg = min(255, int(g + glow * 22))
            bb = min(255, int(b + glow * 8))
            pix[x, y] = (rr, gg, bb, 255)
    return img


def header(draw, title, kicker, accent=GOLD):
    draw.text((92, 74), kicker.upper(), font=F14, fill=accent)
    draw.text((92, 118), title, font=F48, fill=(255, 255, 255))
    draw.rounded_rectangle((92, 248, 342, 260), radius=6, fill=accent)


def label(draw, xy, text, fill=(100, 116, 139), f=F12):
    draw.text(xy, text.upper(), font=f, fill=fill)


def draw_sidebar(draw, x=92, y=315, w=310, h=560, active="Search"):
    rounded(draw, (x, y, x + w, y + h), 24, (9, 25, 48), outline=(28, 49, 78), width=2)
    items = ["Search", "Reports", "Contracts", "Evidence", "Recovery", "Lien Service"]
    for i, item in enumerate(items):
        yy = y + 42 + i * 76
        fill = (245, 190, 89) if item == active else (148, 163, 184)
        if item == active:
            rounded(draw, (x + 26, yy - 16, x + w - 26, yy + 42), 14, (22, 47, 82), outline=(54, 76, 110))
        draw.ellipse((x + 44, yy, x + 64, yy + 20), fill=fill)
        draw.text((x + 86, yy - 6), item, font=F14, fill=(255, 255, 255) if item == active else MUTED)


def draw_status_pill(draw, x, y, text, color):
    tw = draw.textlength(text, font=F12)
    light_fill = (
        min(255, color[0] + 190),
        min(255, color[1] + 88),
        min(255, color[2] + 70),
    )
    rounded(draw, (x, y, x + int(tw) + 46, y + 42), 21, light_fill, outline=color[:3], width=2)
    draw.ellipse((x + 14, y + 14, x + 26, y + 26), fill=color[:3])
    draw.text((x + 34, y + 7), text, font=F12, fill=color[:3])


def asset_search_dossier():
    img = gradient_bg()
    draw = ImageDraw.Draw(img)
    header(draw, "Search dossier", "Client Bureau Intelligence")
    draw_sidebar(draw)
    shadow_card(img, (460, 305, 1505, 875), radius=32, fill=(248, 250, 252), outline=(226, 232, 240))
    draw = ImageDraw.Draw(img)
    label(draw, (510, 350), "Private match result", fill=(120, 90, 30))
    draw.text((510, 392), "John S. - Orlando", font=F28, fill=(15, 23, 42))
    draw.text((510, 468), "Approved. Private evidence.", font=F16, fill=(71, 85, 105))
    rounded(draw, (1140, 352, 1425, 520), 24, NAVY, outline=(30, 41, 59), width=2)
    draw.text((1182, 388), "CB Rating", font=F14, fill=GOLD_LIGHT)
    draw.text((1180, 430), "82", font=F48, fill=(255, 255, 255))
    draw.text((1302, 466), "/100", font=F18, fill=MUTED)
    rows = [
        ("Match reason", "Name + city + project context"),
        ("Evidence", "Invoices and messages on file"),
        ("Response", "Right-of-response available"),
    ]
    for i, (left, right) in enumerate(rows):
        y = 575 + i * 68
        rounded(draw, (510, y, 1438, y + 46), 12, (255, 255, 255), outline=(226, 232, 240))
        draw.text((536, y + 10), left, font=F12, fill=(100, 116, 139))
        draw.text((770, y + 8), right, font=F14, fill=(15, 23, 42))
    draw_status_pill(draw, 510, 800, "Moderated public profile", GREEN)
    draw_status_pill(draw, 880, 800, "Private identifiers hidden", BLUE)
    img.convert("RGB").save(OUT_DIR / "search-dossier-console.webp", "WEBP", quality=90, method=6)


def asset_agreement_packet():
    img = gradient_bg(top=(4, 18, 34), bottom=(25, 30, 42))
    draw = ImageDraw.Draw(img)
    header(draw, "Florida agreement packet", "Private signing workflow")
    shadow_card(img, (104, 318, 610, 872), radius=30, fill=(255, 252, 243), outline=(238, 216, 170))
    shadow_card(img, (680, 280, 1496, 880), radius=32, fill=PAPER, outline=(226, 232, 240))
    draw = ImageDraw.Draw(img)
    label(draw, (150, 366), "Starter review prompts", fill=(139, 92, 35))
    prompts = ["Scope summary", "Included / excluded work", "Deposit + milestones", "Change-order policy", "Lien notice review", "Client e-signature"]
    for i, item in enumerate(prompts):
        y = 430 + i * 62
        draw.rounded_rectangle((150, y, 560, y + 42), radius=12, fill=(255, 255, 255), outline=(231, 211, 170), width=1)
        draw.ellipse((172, y + 13, 188, y + 29), fill=GOLD)
        draw.text((206, y + 7), item, font=F14, fill=(30, 41, 59))
    label(draw, (735, 335), "Agreement packet", fill=(120, 90, 30))
    draw.text((735, 382), "Residential Service Packet", font=F28, fill=(15, 23, 42))
    draw.text((735, 455), "Private link ready after contractor review.", font=F16, fill=(71, 85, 105))
    terms = [("Contract amount", "$18,400"), ("Deposit", "$3,680"), ("Milestone 1", "Rough-in complete"), ("Final due", "Completion approval")]
    for i, (left, right) in enumerate(terms):
        x = 735 + (i % 2) * 360
        y = 560 + (i // 2) * 120
        rounded(draw, (x, y, x + 320, y + 82), 18, (255, 255, 255), outline=(226, 232, 240), width=2)
        draw.text((x + 24, y + 16), left, font=F12, fill=(100, 116, 139))
        draw.text((x + 24, y + 42), right, font=F16, fill=(15, 23, 42))
    draw_status_pill(draw, 735, 795, "Private signing link", GOLD)
    draw_status_pill(draw, 1055, 795, "Not legal advice", RED)
    img.convert("RGB").save(OUT_DIR / "florida-agreement-packet.webp", "WEBP", quality=90, method=6)


def asset_admin_ops():
    img = gradient_bg(top=(5, 15, 30), bottom=(9, 20, 35))
    draw = ImageDraw.Draw(img)
    header(draw, "Admin Ops CRM", "Internal moderation command")
    draw_sidebar(draw, active="Reports")
    shadow_card(img, (450, 310, 1498, 880), radius=30, fill=(248, 250, 252), outline=(226, 232, 240))
    draw = ImageDraw.Draw(img)
    label(draw, (500, 354), "What needs action today", fill=(120, 90, 30))
    metrics = [("Pending reports", "14", GOLD), ("Evidence review", "8", BLUE), ("Disputes", "3", RED), ("Profile edits", "21", GREEN)]
    for i, (name, value, color) in enumerate(metrics):
        x = 500 + i * 238
        rounded(draw, (x, 410, x + 205, 540), 20, (255, 255, 255), outline=(226, 232, 240), width=2)
        draw.text((x + 20, 432), name, font=F12, fill=(100, 116, 139))
        draw.text((x + 20, 470), value, font=F36, fill=(15, 23, 42))
        draw.rounded_rectangle((x + 20, 512, x + 115, 520), radius=4, fill=color)
    queue = [
        ("Report moderation", "Evidence on file", "Approve / edit summary"),
        ("Florida lien case", "Signature required", "Request more info"),
        ("Contract packet", "Signed", "Audit snapshot"),
        ("Business profile", "Claim review", "Verify public fields"),
    ]
    for i, row in enumerate(queue):
        y = 595 + i * 62
        rounded(draw, (500, y, 1436, y + 48), 14, (255, 255, 255), outline=(226, 232, 240), width=1)
        draw.text((528, y + 11), row[0], font=F14, fill=(15, 23, 42))
        draw.text((830, y + 12), row[1], font=F12, fill=(100, 116, 139))
        draw.text((1122, y + 11), row[2], font=F12, fill=(120, 90, 30))
    draw_status_pill(draw, 500, 820, "Audit notes required", GOLD)
    draw_status_pill(draw, 840, 820, "Private data sealed", GREEN)
    img.convert("RGB").save(OUT_DIR / "admin-ops-crm-console.webp", "WEBP", quality=90, method=6)


def asset_mobile_field_app():
    img = gradient_bg(top=(2, 12, 28), bottom=(14, 23, 35))
    draw = ImageDraw.Draw(img)
    header(draw, "Mobile field app", "Contractor command center")
    shadow_card(img, (150, 245, 635, 895), radius=56, fill=(7, 18, 35), outline=(48, 64, 88))
    shadow_card(img, (735, 300, 1470, 835), radius=30, fill=PAPER, outline=(226, 232, 240))
    draw = ImageDraw.Draw(img)
    rounded(draw, (204, 300, 580, 382), 22, (11, 31, 58), outline=(43, 60, 86), width=2)
    draw.text((230, 324), "Check a Client", font=F18, fill=(255, 255, 255))
    rounded(draw, (204, 420, 580, 520), 22, (255, 255, 255), outline=(226, 232, 240), width=2)
    draw.text((232, 444), "Today", font=F12, fill=(100, 116, 139))
    draw.text((232, 474), "3 actions ready", font=F18, fill=(15, 23, 42))
    cards = [("Search", GOLD), ("Reports", BLUE), ("Contracts", GREEN), ("Lien", RED)]
    for i, (name, color) in enumerate(cards):
        x = 204 + (i % 2) * 188
        y = 560 + (i // 2) * 120
        rounded(draw, (x, y, x + 170, y + 92), 20, (11, 31, 58), outline=(43, 60, 86), width=2)
        draw.ellipse((x + 22, y + 26, x + 46, y + 50), fill=color)
        draw.text((x + 62, y + 24), name, font=F14, fill=(255, 255, 255))
    label(draw, (795, 356), "Native field workflow", fill=(120, 90, 30))
    draw.text((795, 404), "Job-stage app flow", font=F28, fill=(15, 23, 42))
    bullets = [
        ("Before the job", "Search, watchlists, contract packets"),
        ("During the job", "Reports, evidence, change records"),
        ("After an issue", "Recovery and Florida lien service"),
    ]
    for i, (title, text) in enumerate(bullets):
        y = 520 + i * 92
        rounded(draw, (795, y, 1395, y + 66), 16, (255, 255, 255), outline=(226, 232, 240), width=2)
        draw.text((824, y + 10), title, font=F14, fill=(15, 23, 42))
        draw.text((824, y + 38), text, font=F12, fill=(100, 116, 139))
    draw_status_pill(draw, 795, 785, "Secure mobile session", GREEN)
    img.convert("RGB").save(OUT_DIR / "mobile-field-app-console.webp", "WEBP", quality=90, method=6)


if __name__ == "__main__":
    asset_search_dossier()
    asset_agreement_packet()
    asset_admin_ops()
    asset_mobile_field_app()
    print("Generated launch WebP assets in public/images")
