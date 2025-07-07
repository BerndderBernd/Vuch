# 🖼️ KI Bildgenerator – Entwicklerdokumentation

Diese Dokumentation beschreibt alle öffentlich zugänglichen Komponenten, Funktionen und externen APIs der App. Zusätzlich enthält sie Beispiele und Hinweise zur Nutzung und Erweiterung.

---

## Inhaltsverzeichnis

1. Überblick
2. Projektstruktur
3. Externe Abhängigkeiten & öffentliche APIs
4. HTML-Komponenten
5. JavaScript-API (script.js)
6. Schnellstart & Beispiele
7. Erweiterungsmöglichkeiten

---

## 1 – Überblick

Die Anwendung ist ein client-seitiger Bildgenerator, der mithilfe des **Google Imagen 3**-Modells Bilder aus Textprompts erzeugt. Der Benutzer gibt eine Beschreibung ein, klickt auf „Generieren“ und erhält daraufhin ein Base64-kodiertes Bild, das im Browser angezeigt wird.

---

## 2 – Projektstruktur

```
/ (Projektwurzel)
├── index.html       # Zentrales HTML-Dokument
├── script.js        # Hauptlogik (UI-Interaktion & API-Aufruf)
├── config.js*       # Automatisch generierte Datei mit API-Schlüssel (env)
├── DOCUMENTATION.md # Diese Datei
└── README.md        # Kurzbeschreibung
```
\* *`config.js` wird von CI-Pipelines (GitHub Actions) generiert und enthält den öffentlichen API-Key. In lokalen Umgebungen muss diese Datei manuell erstellt werden – siehe Abschnitt 6.*

---

## 3 – Externe Abhängigkeiten & öffentliche APIs

### 3.1 Tailwind CSS

Zur schnellen Gestaltung der Oberfläche wird Tailwind CSS über ein CDN eingebunden:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Es sind keine weiteren Schritte erforderlich.

### 3.2 Google Imagen 3

Die Bildgenerierung erfolgt über das **v1beta Endpoint** des Google Generative Language Service:

```
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=<GEMINI_API_KEY>
```

**Request-Body**
```json
{
  "instances": [ { "prompt": "Ein roter Fuchs im Schnee" } ],
  "parameters": { "sampleCount": 1 }
}
```

**Relevante Felder in der Antwort**
```
.predictions[0].bytesBase64Encoded   # Base64-PNG-Inhalt
```

Weitere Dokumentation finden Sie unter <https://cloud.google.com/vertex-ai/docs/generative-ai>

---

## 4 – HTML-Komponenten (index.html)

| Element-ID          | Typ / Zweck                                                         |
|---------------------|---------------------------------------------------------------------|
| `prompt-input`      | `<input>` – Textfeld für den Prompt                                 |
| `generate-btn`      | `<button>` – löst `generateImage()` aus                             |
| `btn-text`          | `<span>` – sichtbarer Button-Text                                   |
| `btn-loader`        | `<div>` – CSS-Loader (wird per JS ein/ausgeblendet)                 |
| `result-container`  | `<div>` – Wrapper für Ergebnis, Fehlermeldung & Platzhalter         |
| `placeholder-text`  | `<p>` – Standard-/Status-Text                                       |
| `result-image`      | `<img>` – zeigt das generierte Bild                                 |
| `error-message`     | `<p>` – Fehlermeldungen                                             |

---

## 5 – JavaScript-API (script.js)

### 5.1 Globale Konstanten

Beim Laden der Seite werden wesentliche DOM-Elemente gecached:

```js
const generateBtn   = document.getElementById('generate-btn');
const promptInput   = document.getElementById('prompt-input');
const resultImage   = document.getElementById('result-image');
// … weitere siehe Quellcode
```

Zusätzlich wird der API-Key aus der Injected-Variable `window.env.GEMINI_API_KEY` gelesen.

### 5.2 Function: `setLoading(isLoading)`

| Parameter | Typ    | Beschreibung                                   |
|-----------|--------|-------------------------------------------------|
| `isLoading` | boolean | `true` → UI in Ladezustand versetzen, `false` → zurücksetzen |

```js
function setLoading(isLoading) {
  if (isLoading) {
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    generateBtn.disabled = true;
  } else {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    generateBtn.disabled = false;
  }
}
```

**Beispiel**
```js
setLoading(true);   // Zeigt den Spinner und deaktiviert den Button
```

### 5.3 Async Function: `generateImage()`

Hauptfunktion. Führt folgende Schritte aus:

1. Liest den Prompt aus `promptInput`.
2. Validiert Eingabe (leerer Prompt → `alert`).
3. Setzt UI in Ladezustand (`setLoading(true)`).
4. Baut den API-Request und ruft den Imagen-3-Endpoint auf.
5. Prüft HTTP-Status; wirft Exception bei Fehler.
6. Wertet `result.predictions[0].bytesBase64Encoded` aus und zeigt das Bild an.
7. Bei Fehlern: Zeigt Meldung in `errorMessage`.
8. Schaltet Ladezustand ab (`finally`-Block).

```js
async function generateImage() {
  const prompt = promptInput.value;
  if (!prompt) {
    alert('Bitte geben Sie eine Beschreibung ein.');
    return;
  }
  setLoading(true);
  /* … API-Call & Error-Handling … */
}
```

Die Funktion ist über den Click-Handler des Buttons öffentlich zugänglich, kann aber auch manuell aufgerufen werden:

```js
document.getElementById('generate-btn').addEventListener('click', generateImage);
```

---

## 6 – Schnellstart & Beispiele

### 6.1 Lokales Setup

1. **Repository klonen**
   ```bash
   git clone <repo-url>
   cd <projekt>
   ```
2. **API-Key beschaffen**
   Beantragen Sie über Google Cloud einen gültigen `GEMINI_API_KEY`.
3. **`config.js` erstellen**
   Legen Sie im Projektwurzel-Verzeichnis eine Datei `config.js` an:
   ```js
   window.env = {
     GEMINI_API_KEY: 'PASTE_YOUR_KEY_HERE'
   };
   ```
4. **Starten**
   Öffnen Sie `index.html` in einem Browser (kein Web-Server nötig).

### 6.2 Beispiel: Bild generieren

1. Geben Sie im Eingabefeld z. B. folgenden Prompt ein:
   > Ein futuristischer Stadt-Panorama mit Neonlichtern zur blauen Stunde
2. Klicken Sie **Generieren**.
3. Nach wenigen Sekunden erscheint das generierte PNG-Bild im Ergebnis-Container.

---

## 7 – Erweiterungsmöglichkeiten

| Idee | Hinweis |
|------|---------|
| Mehrere Bilder gleichzeitig | `parameters.sampleCount` ≥ 1 und Schleife über `predictions` |
| Fortschrittsanzeige | Prüfen, ob der API long-running operation unterstützt oder Polling implementieren |
| Prompt-Historie | Eingaben z. B. in `localStorage` persistieren und rendern |
| Responsive Preview | CSS-Klassen für mobile Geräte optimieren |
| Backend-Proxy | API-Key serverseitig halten, um Exposition im Frontend zu vermeiden |

---

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz – siehe `LICENSE` (falls vorhanden).

---

*Letzte Aktualisierung: <!-- CURSOR_TIMESTAMP -->*