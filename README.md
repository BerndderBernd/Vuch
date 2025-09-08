## Cartoon-Bilderbuch App

Eine einfache App, mit der Eltern und Kinder eigene Fotos hochladen, automatisch in einen Cartoon-Stil umwandeln und daraus ein personalisiertes Bilderbuch mit Texten erstellen können. Das Bilderbuch kann als PDF exportiert werden.

### Struktur
- `backend/`: FastAPI-Server (Upload, Cartoonize, Buch, PDF)
- `frontend/`: React (Vite) UI (Upload, Vorschau, Seiten, Bildunterschriften, Export)

### Voraussetzungen
- Linux mit `python3`, `python3-venv`, `npm`/`node` installiert

### Starten
In zwei Terminals:

1) Backend starten
```bash
bash /workspace/backend/run.sh
```

2) Frontend starten
```bash
bash /workspace/frontend/run.sh
```

Frontend erreichbar unter: `http://localhost:5173`

### Nutzung
- Bilder wählen: Upload im linken Panel (werden automatisch cartoonisiert)
- Seiten: Thumbnails wählen, Navigation mit Zurück/Weiter
- Texte: Unter jedem Bild eine Bildunterschrift eingeben
- Export: Button "PDF exportieren" öffnet den PDF-Download

### Konfiguration
- API-Basis im Frontend: nutzt automatisch `http(s)://<host>:8000`
- Statische Dateien des Backends unter `/static` (Uploads, Cartoons, Bücher, PDFs)

### Hinweise
- Die Cartoonisierung nutzt aktuell einen performanten PIL-Filter-Ansatz als Platzhalter. Für höhere Qualität kann ein externes Modell (z. B. Stable Diffusion oder OpenAI Images) in `backend/app/cartoonize.py` integriert werden.

# Vuch