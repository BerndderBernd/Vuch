import React, { useMemo, useRef, useState } from 'react'

type UploadedImage = {
  id: string
  originalUrl: string
  cartoonUrl: string
}

type BookPage = {
  imageUrl: string
  caption: string
}

const API_BASE = `${location.protocol}//${location.hostname}:8000`

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [title, setTitle] = useState<string>('Mein Cartoon-Bilderbuch')
  const [pages, setPages] = useState<BookPage[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [creating, setCreating] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentPage = pages[currentIndex]

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files)
    const results: UploadedImage[] = []
    for (const f of list) {
      const form = new FormData()
      form.append('file', f)
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        alert('Upload fehlgeschlagen')
        continue
      }
      const data = await res.json()
      results.push({ id: data.image_id, originalUrl: `${API_BASE}${data.original_url}`, cartoonUrl: `${API_BASE}${data.cartoon_url}` })
    }
    setImages(prev => [...prev, ...results])
    setPages(prev => [
      ...prev,
      ...results.map(r => ({ imageUrl: r.cartoonUrl, caption: '' }))
    ])
  }

  const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIndex(i => Math.min(pages.length - 1, i + 1))

  const updateCaption = (text: string) => {
    setPages(prev => prev.map((p, idx) => idx === currentIndex ? { ...p, caption: text } : p))
  }

  const createBook = async () => {
    if (pages.length === 0) return
    setCreating(true)
    try {
      const payload = {
        title,
        pages: pages.map(p => ({ image_path: p.imageUrl.replace(API_BASE, ''), caption: p.caption }))
      }
      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Buch-Erstellung fehlgeschlagen')
      const book = await res.json()
      const pdfUrl = `${API_BASE}/book/${book.book_id}/pdf`
      const a = document.createElement('a')
      a.href = pdfUrl
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
    } catch (e: any) {
      alert(e.message || 'Fehler beim Erstellen des PDFs')
    } finally {
      setCreating(false)
    }
  }

  const pageCounter = useMemo(() => `${pages.length ? currentIndex + 1 : 0} / ${pages.length}`, [currentIndex, pages.length])

  return (
    <div className="app">
      <header className="header">
        <h1>Mein Cartoon-Bilderbuch</h1>
      </header>
      <main className="content">
        <section className="left">
          <div className="upload-card">
            <h2>Bilder hochladen</h2>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleUpload(e.target.files)} />
            <p>Fotos werden automatisch in einen Cartoon-Stil umgewandelt.</p>
          </div>
          <div className="thumbs">
            {pages.map((p, idx) => (
              <button key={idx} className={`thumb ${idx === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(idx)}>
                <img src={p.imageUrl} alt={`Seite ${idx + 1}`} />
              </button>
            ))}
          </div>
        </section>
        <section className="right">
          <div className="book-toolbar">
            <input className="title" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="nav">
              <button onClick={goPrev} disabled={currentIndex === 0}>Zurück</button>
              <span>{pageCounter}</span>
              <button onClick={goNext} disabled={currentIndex >= pages.length - 1}>Weiter</button>
            </div>
          </div>

          <div className="page" key={currentIndex}>
            {currentPage ? (
              <>
                <div className="image-area">
                  <img src={currentPage.imageUrl} className="big-image" alt="Cartoon" />
                </div>
                <textarea
                  className="caption"
                  placeholder="Schreibe eine Bildunterschrift..."
                  value={currentPage.caption}
                  onChange={e => updateCaption(e.target.value)}
                />
              </>
            ) : (
              <div className="empty">Lade Bilder hoch, um zu starten</div>
            )}
          </div>

          <div className="actions">
            <button onClick={createBook} disabled={creating || pages.length === 0}>
              {creating ? 'Erstelle PDF...' : 'PDF exportieren'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

