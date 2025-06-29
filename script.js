// Elemente aus dem DOM abrufen
const generateBtn = document.getElementById('generate-btn');
const promptInput = document.getElementById('prompt-input');
const resultImage = document.getElementById('result-image');
const resultContainer = document.getElementById('result-container');
const placeholderText = document.getElementById('placeholder-text');
const errorMessage = document.getElementById('error-message');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

// Sicherstellen, dass die `env`-Variable existiert, bevor der Schlüssel gelesen wird
const apiKey = window.env ? window.env.GEMINI_API_KEY : undefined;

// Überprüfen, ob der API-Schlüssel geladen wurde
if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("API-Schlüssel nicht gefunden!");
    // Zeigt eine Fehlermeldung für den Benutzer an
    placeholderText.classList.add('hidden');
    errorMessage.textContent = 'Fehler: API-Schlüssel konnte nicht geladen werden. Bitte überprüfen Sie die Konfiguration.';
    errorMessage.classList.remove('hidden');
    // Deaktiviert den Button, da keine Anfragen möglich sind
    generateBtn.disabled = true;
    generateBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
}

// Event-Listener für den Button-Klick
generateBtn.addEventListener('click', generateImage);

// Funktion zum Anzeigen des Ladezustands
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

// Asynchrone Funktion zur Bildgenerierung
async function generateImage() {
    const prompt = promptInput.value;

    // Überprüfen, ob ein Prompt eingegeben wurde
    if (!prompt) {
        alert('Bitte geben Sie eine Beschreibung für das Bild ein.');
        return;
    }
    
    // UI für den Ladevorgang vorbereiten
    setLoading(true);
    errorMessage.classList.add('hidden');
    resultImage.classList.add('hidden');
    placeholderText.textContent = 'Bild wird generiert, bitte warten...';
    placeholderText.classList.remove('hidden');

    // API-Endpunkt für Imagen 3
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

    // Nutzdaten für die API-Anfrage
    const payload = {
        instances: [{ "prompt": prompt }],
        parameters: { "sampleCount": 1 }
    };

    try {
        // API-Anfrage senden
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Antwort überprüfen
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API-Fehler (${response.status}): ${errorData.error?.message || 'Unbekannter Fehler'}`);
        }

        const result = await response.json();

        // Überprüfen, ob die Antwort Bilder enthält
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const imageData = result.predictions[0].bytesBase64Encoded;
            resultImage.src = `data:image/png;base64,${imageData}`;
            resultImage.classList.remove('hidden');
            placeholderText.classList.add('hidden');
        } else {
            throw new Error('Die API-Antwort enthielt keine gültigen Bilddaten.');
        }

    } catch (error) {
        console.error('Fehler bei der Bildgenerierung:', error);
        errorMessage.textContent = `Ein Fehler ist aufgetreten: ${error.message}`;
        errorMessage.classList.remove('hidden');
        placeholderText.classList.add('hidden');
    } finally {
        // Ladezustand beenden, egal ob erfolgreich oder nicht
        setLoading(false);
    }
}
