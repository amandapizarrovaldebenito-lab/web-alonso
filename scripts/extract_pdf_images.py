from pathlib import Path
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Ideas"
DESTINATION = ROOT / "tmp" / "pdfs" / "extracted"


def slug(value: str) -> str:
    replacements = str.maketrans("áéíóúñÁÉÍÓÚÑ ", "aeiounAEIOUN-")
    return value.translate(replacements).lower()


DESTINATION.mkdir(parents=True, exist_ok=True)

for pdf_path in sorted(SOURCE.glob("*.pdf")):
    page = PdfReader(pdf_path).pages[0]
    page_dir = DESTINATION / slug(pdf_path.stem)
    page_dir.mkdir(parents=True, exist_ok=True)

    for index, image in enumerate(page.images, start=1):
        extension = Path(image.name).suffix or ".png"
        output = page_dir / f"image-{index:02d}{extension}"
        output.write_bytes(image.data)
        print(output.relative_to(ROOT))
