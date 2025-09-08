from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from pathlib import Path
import shutil

from .cartoonize import cartoonize_image
from .pdf_export import export_book_to_pdf


BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
CARTOONS_DIR = STORAGE_DIR / "cartoons"
BOOKS_DIR = STORAGE_DIR / "books"
PDF_DIR = STORAGE_DIR / "pdfs"

for d in [STORAGE_DIR, UPLOADS_DIR, CARTOONS_DIR, BOOKS_DIR, PDF_DIR]:
    d.mkdir(parents=True, exist_ok=True)


class BookPage(BaseModel):
    image_path: str
    caption: Optional[str] = ""


class CreateBookRequest(BaseModel):
    title: str
    pages: List[BookPage]


app = FastAPI(title="Cartoon Storybook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (uploaded/cartoonized images, generated PDFs)
app.mount("/static", StaticFiles(directory=str(STORAGE_DIR)), name="static")


@app.post("/upload")
async def upload_and_cartoonize(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_id = uuid4().hex
    original_ext = Path(file.filename).suffix.lower() or ".jpg"
    original_path = UPLOADS_DIR / f"{image_id}{original_ext}"

    with original_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cartoon_path = CARTOONS_DIR / f"{image_id}.png"
    try:
        cartoonize_image(str(original_path), str(cartoon_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cartoonize failed: {e}")

    return {
        "image_id": image_id,
        "original_url": f"/static/uploads/{original_path.name}",
        "cartoon_url": f"/static/cartoons/{cartoon_path.name}",
        "original_path": str(original_path),
        "cartoon_path": str(cartoon_path),
    }


@app.post("/book")
async def create_book(req: CreateBookRequest):
    book_id = uuid4().hex
    book_dir = BOOKS_DIR / book_id
    book_dir.mkdir(parents=True, exist_ok=True)

    # Normalize image paths to absolute paths under storage
    normalized_pages = []
    for idx, page in enumerate(req.pages):
        # Allow either absolute path or /static path
        input_path = page.image_path
        p = Path(input_path)
        if str(input_path).startswith("/static/"):
            # Map /static/... to actual file path under STORAGE_DIR
            rel = input_path[len("/static/"):]
            p = STORAGE_DIR / rel
        elif not p.is_absolute():
            # Treat as relative to STORAGE_DIR
            p = STORAGE_DIR / input_path
        if not p.exists():
            raise HTTPException(status_code=400, detail=f"Image not found: {input_path}")

        # Copy page image into the book folder for immutability
        page_filename = f"page_{idx+1:02d}{p.suffix or '.png'}"
        dest = book_dir / page_filename
        shutil.copyfile(p, dest)
        normalized_pages.append({
            "image_path": str(dest),
            "image_url": f"/static/books/{book_id}/{dest.name}",
            "caption": page.caption or "",
        })

    # Persist simple book metadata
    meta = {
        "book_id": book_id,
        "title": req.title,
        "pages": normalized_pages,
    }
    (book_dir / "book.json").write_text(__import__("json").dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    return meta


@app.get("/book/{book_id}")
async def get_book(book_id: str):
    path = BOOKS_DIR / book_id / "book.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Book not found")
    return __import__("json").loads(path.read_text(encoding="utf-8"))


@app.get("/book/{book_id}/pdf")
async def get_book_pdf(book_id: str):
    book_path = BOOKS_DIR / book_id / "book.json"
    if not book_path.exists():
        raise HTTPException(status_code=404, detail="Book not found")
    book = __import__("json").loads(book_path.read_text(encoding="utf-8"))

    pdf_path = PDF_DIR / f"{book_id}.pdf"
    try:
        export_book_to_pdf(book, str(pdf_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {e}")

    return FileResponse(str(pdf_path), media_type="application/pdf", filename=f"{book.get('title','storybook')}.pdf")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Cartoon Storybook API"}

