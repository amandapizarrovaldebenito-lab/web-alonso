from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "pdfs"
DESTINATION = ROOT / "assets" / "images"


CROPS = {
    "portrait-alonso.webp": ("pagina inicio.png", (930, 130, 1917, 650)),
    "home-publications.webp": ("pagina inicio.png", (42, 925, 480, 1058)),
    "home-projects.webp": ("pagina inicio.png", (500, 925, 958, 1058)),
    "home-team.webp": ("pagina inicio.png", (980, 925, 1422, 1058)),
    "home-teaching.webp": ("pagina inicio.png", (1440, 925, 1875, 1058)),
    "projects-hero.webp": ("pagina proyectos.png", (1000, 140, 1880, 590)),
    "project-featured.webp": ("pagina proyectos.png", (20, 980, 950, 1580)),
    "research-hero.webp": ("pagina investigacion.png", (1010, 120, 1910, 610)),
    "research-flood.webp": ("pagina investigacion.png", (40, 850, 810, 1330)),
    "teaching-hero.webp": ("pagina teaching.png", (900, 100, 1910, 760)),
    "course-hydrology.webp": ("pagina teaching.png", (40, 1000, 650, 1870)),
    "course-hydraulics.webp": ("pagina teaching.png", (40, 1850, 650, 2720)),
    "collaborators-hero.webp": ("pagina colaboradores y estudiantes.png", (980, 100, 1910, 620)),
    "contact-hero.webp": ("pagina contacto.png", (960, 80, 1910, 620)),
    "project-detail-hero.webp": ("*proyecto especifico.png", (900, 100, 1910, 620)),
    "project-cycle.webp": ("*proyecto especifico.png", (920, 1500, 1900, 2050)),
    "project-map.webp": ("*proyecto especifico.png", (810, 3250, 1900, 3680)),
}


DESTINATION.mkdir(parents=True, exist_ok=True)

for output_name, (source_name, box) in CROPS.items():
    source_path = next(SOURCE.glob(source_name)) if "*" in source_name else SOURCE / source_name
    source = Image.open(source_path).convert("RGB")
    crop = source.crop(box)
    crop.save(DESTINATION / output_name, "WEBP", quality=86, method=6)
    print(f"{output_name}: {crop.size}")
