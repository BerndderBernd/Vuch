# 🖼️ AI Image Generator – Developer Documentation

This document describes the public components, functions, and external API interactions that **actually exist** in the current codebase (`index.html` and `script.js`).

---

## Table of Contents

1. Overview
2. Project structure
3. External dependencies & public API
4. HTML components (`index.html`)
5. JavaScript API (`script.js`)
6. Getting started & example usage

---

## 1 – Overview

The application is a **client-side** image generator that sends a prompt to the Google *Imagen 3* model and displays the returned PNG image in the browser. Everything runs locally in the user's browser—no backend code is included.

---

## 2 – Project structure

```
/ (project root)
├── index.html        # Main HTML document
├── script.js         # UI logic & API call
├── README.md         # Short placeholder file
└── DOCUMENTATION.md  # This file
```

`script.js` expects an environment variable named `window.env.GEMINI_API_KEY` **before** it runs. You can inject it with a small inline `<script>` tag (see section 6).

---

## 3 – External dependency & public API

### Tailwind CSS (styling)

Loaded via CDN for quick styling:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Google Imagen 3 (image generation)

Endpoint called from `script.js`:

```
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=<GEMINI_API_KEY>
```

Request body sent by the app (fixed to `sampleCount: 1`):

```json
{
  "instances": [ { "prompt": "A red fox in the snow at dawn" } ],
  "parameters": { "sampleCount": 1 }
}
```

In the response the code reads:
```
.predictions[0].bytesBase64Encoded   # Base64-encoded PNG
```

---

## 4 – HTML components (`index.html`)

| Element ID         | Purpose / Notes                                                 |
|--------------------|-----------------------------------------------------------------|
| `prompt-input`     | `<input>` – text field where the user types the prompt          |
| `generate-btn`     | `<button>` – triggers `generateImage()`                         |
| `btn-text`         | `<span>` – visible label inside the button                      |
| `btn-loader`       | `<div>` – spinner shown while waiting for the API               |
| `result-container` | `<div>` – wrapper for placeholder, image and error message      |
| `placeholder-text` | `<p>` – default & status messages                               |
| `result-image`     | `<img>` – shows the generated image (hidden until set)          |
| `error-message`    | `<p>` – displays errors returned by the API or client-side code |

---

## 5 – JavaScript API (`script.js`)

### 5.1 Constants

Immediately after the DOM is parsed the following elements are cached:

```js
const generateBtn   = document.getElementById("generate-btn");
const promptInput   = document.getElementById("prompt-input");
const resultImage   = document.getElementById("result-image");
const resultContainer = document.getElementById("result-container");
const placeholderText = document.getElementById("placeholder-text");
const errorMessage  = document.getElementById("error-message");
const btnText       = document.getElementById("btn-text");
const btnLoader     = document.getElementById("btn-loader");
```

### 5.2 Function: `setLoading(isLoading)`

Controls the loading state of the *Generate* button.

```js
function setLoading(isLoading) {
  if (isLoading) {
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");
    generateBtn.disabled = true;
  } else {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
    generateBtn.disabled = false;
  }
}
```

### 5.3 Async function: `generateImage()`

Main workflow:

1. Read the prompt from the input field.
2. Validate (empty prompt → `alert`).
3. Prepare UI: `setLoading(true)`, hide previous error/image, show "Generating..." placeholder.
4. Call the Imagen 3 endpoint (fetch POST request).
5. On **success**: decode `bytesBase64Encoded`, set `resultImage.src`, show image.
6. On **error**: write the message into `errorMessage` and show it.
7. Always exit loading state in the `finally` block.

The function is wired to the `click` event of `generate-btn`:

```js
generateBtn.addEventListener("click", generateImage);
```

There are **no other public functions or components** in the codebase.

---

## 6 – Getting started

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <project>
   ```
2. **Provide an API key**
   Insert an inline script **before** `script.js` in `index.html`:
   ```html
   <script>
     window.env = { GEMINI_API_KEY: "YOUR_KEY_HERE" };
   </script>
   ```
3. **Open the page**
   Double-click `index.html` or serve the directory with any static file server.

---

*Last updated: <!-- CURSOR_TIMESTAMP -->*