# 🖼️ AI Image Generator – Developer Documentation

This document describes every publicly exposed component, function and external API in the current codebase. Examples and step-by-step usage instructions are included.

---

## Table of Contents

1. Overview
2. Project structure
3. External dependencies & public APIs
4. HTML components (`index.html`)
5. JavaScript API (`script.js`)
6. Getting started & examples
7. Ideas for further improvement

---

## 1 – Overview

The application is a **client-side** image generator that calls the **Google Imagen 3** model. A user enters a text prompt, clicks *Generate* and receives a Base64-encoded PNG that is rendered directly in the browser.

---

## 2 – Project structure

```
/ (project root)
├── index.html        # Main HTML document
├── script.js         # UI logic & API call
├── README.md         # Short description (placeholder)
└── DOCUMENTATION.md  # You are here
```

At runtime the page expects `window.env.GEMINI_API_KEY` to be defined **before** `script.js` executes. How you inject that variable is up to you (see section 6).

---

## 3 – External dependencies & public APIs

### 3.1 Tailwind CSS

Used for quick styling, loaded via CDN:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

No additional configuration is required.

### 3.2 Google Imagen 3

The image itself is generated through the *Generative Language* API (v1beta):

```
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=<GEMINI_API_KEY>
```

**Request body**
```json
{
  "instances": [ { "prompt": "A red fox in the snow at dawn" } ],
  "parameters": { "sampleCount": 1 }
}
```

**Relevant field in the response**
```
.predictions[0].bytesBase64Encoded   # Base64-encoded PNG
```

Full API reference: <https://cloud.google.com/vertex-ai/docs/generative-ai>

---

## 4 – HTML components (`index.html`)

| Element ID        | Type / Purpose                                                    |
|-------------------|-------------------------------------------------------------------|
| `prompt-input`    | `<input>` – text field for the prompt                             |
| `generate-btn`    | `<button>` – triggers `generateImage()`                           |
| `btn-text`        | `<span>` – visible button label                                   |
| `btn-loader`      | `<div>` – spinner shown while waiting for the API                 |
| `result-container`| `<div>` – wrapper for result, error message & placeholder         |
| `placeholder-text`| `<p>` – default / status text                                     |
| `result-image`    | `<img>` – displays the generated image                            |
| `error-message`   | `<p>` – shows errors returned by the API or client-side code      |

---

## 5 – JavaScript API (`script.js`)

### 5.1 Global constants

Immediately after the DOM is parsed, the following elements are cached for fast access:

```js
const generateBtn  = document.getElementById("generate-btn");
const promptInput  = document.getElementById("prompt-input");
const resultImage  = document.getElementById("result-image");
// …further constants omitted for brevity
```

The API key is read from `window.env?.GEMINI_API_KEY`. If the key is missing or empty, an error message is shown and the *Generate* button is disabled.

### 5.2 Function: `setLoading(isLoading)`

| Parameter   | Type    | Description                                             |
|-------------|---------|---------------------------------------------------------|
| `isLoading` | boolean | `true` → show spinner & disable button, `false` → reset |

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

Main entry point. Workflow:

1. Read the prompt from `promptInput`.
2. Validate the input (empty → `alert`).
3. Enter loading state via `setLoading(true)`.
4. Build the request and call the Imagen 3 endpoint.
5. Check HTTP status; throw if not `response.ok`.
6. Decode `result.predictions[0].bytesBase64Encoded` and set `resultImage.src`.
7. On error: display the message in `errorMessage`.
8. Exit loading state in the `finally` block.

```js
async function generateImage() {
  const prompt = promptInput.value;
  if (!prompt) {
    alert("Please enter a description.");
    return;
  }
  setLoading(true);
  /* …API call & error handling… */
}
```

The function is wired to the click handler of the *Generate* button, but can also be invoked programmatically.

---

## 6 – Getting started & examples

### 6.1 Local setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <project>
   ```
2. **Obtain an API key**
   Request a valid *GEMINI_API_KEY* via Google Cloud.
3. **Inject the key**
   Add a script tag **before** `script.js` in `index.html` — for example:
   ```html
   <script>
     window.env = { GEMINI_API_KEY: "PASTE_YOUR_KEY_HERE" };
   </script>
   ```
4. **Open the page**
   Double-click `index.html` or serve the directory with a static file server.

### 6.2 Example: generate an image

1. Enter a prompt such as:
   > A futuristic city skyline with neon lights at blue hour
2. Click **Generate**.
3. After a few seconds the generated PNG appears in the result container.

---

## 7 – Ideas for further improvement

| Idea                             | Hint |
|----------------------------------|------|
| Multiple images per request      | Increase `parameters.sampleCount` and iterate over `predictions`. |
| Progress indication              | Implement polling or server-sent events if the API supports long-running operations. |
| Prompt history                   | Persist prompts in `localStorage` and render a history list. |
| Responsive preview               | Fine-tune Tailwind classes for smaller screens. |
| Backend proxy for the API key    | Store the key server-side to avoid exposing it in the frontend. |

---

*Last updated: <!-- CURSOR_TIMESTAMP -->*