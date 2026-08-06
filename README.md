# LingoCraft - AI Text Improver & Translator SPA

LingoCraft is a modern, responsive Single Page Application (SPA) designed to refine and translate text. Powered by the Google Gemini API, it runs entirely in the browser and processes text inputs locally without requiring backend storage, databases, or user accounts.

## Features

- **Text Refinement ("Improve English")**: Corrects spelling, grammar, punctuation, enhances vocabulary, adjusts tone, and improves sentence structure while retaining the original text's meaning.
- **Language Translation**: Seamlessly translates text to and from 19 popular global languages (Hindi, Spanish, Japanese, French, Arabic, Russian, and more).
- **Text-to-Speech (TTS)**: Built-in reader to hear translated or improved texts for pronunciation and accessibility.
- **Modern UI & Dark Mode**: Professional, card-based interface styled with Tailwind CSS v4, smooth animations, glassmorphism accents, and a reactive theme toggler.
- **Client-Side Key Configuration**: Safely store your Gemini API Key in browser `localStorage` or configure it via standard environment variables.
- **Data Privacy**: No database. No analytics. No backend servers tracking inputs. All operations are direct browser HTTPS requests to the Gemini API.

---

## Supported Languages

- English
- Hindi (हिन्दी)
- Gujarati (ગુજરાતી)
- Marathi (मराठी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Punjabi (ਪੰਜਾਬੀ)
- Urdu (اردو)
- French (Français)
- German (Deutsch)
- Spanish (Español)
- Italian (Italiano)
- Portuguese (Português)
- Japanese (日本語)
- Korean (한국어)
- Chinese (Simplified - 简体中文)
- Arabic (العربية)
- Russian (Русский)

---

## Installation & Local Setup

Follow these steps to run the application locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v16 or higher recommended) and npm installed.

### 1. Install Dependencies

In the project root directory, run:

```bash
npm install
```

### 2. Configure the Gemini API Key

You can configure the API Key in one of two ways:

#### Option A: Via Environment Variables (Recommended for Local Dev)
1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

#### Option B: Via In-App Settings UI (Recommended for Deployed SPA)
1. Open the application.
2. Click the **Settings Gear Icon ⚙️** at the top right of the page.
3. Enter your Gemini API key (it starts with `AIzaSy...`) and click **Save Settings**.
4. The key will be securely saved in your browser's local storage (`localStorage`).

> 💡 **Don't have a Gemini API Key?**
> Get a free API Key instantly by visiting the [Google AI Studio](https://aistudio.google.com/).

### 3. Run the Project Locally

Start the Vite development server by running:

```bash
npm run dev
```

The server will spin up and show you a URL (e.g., `http://localhost:5173`). Open that URL in your browser to view and interact with the application.

### 4. Build for Production

To compile the application into optimized static assets ready for deployment (e.g., to Vercel, Netlify, or GitHub Pages), run:

```bash
npm run build
```

The output files will be built into the `dist/` directory.

---

## Technical Stack

- **Core**: React v18 (Hooks, functional components)
- **Bundler**: Vite (Fast HMR and building)
- **Styling**: Tailwind CSS v4 (native `@tailwindcss/vite` configuration, modern variables, HSL-based colors)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **API**: Google Gemini API (`gemini-1.5-flash` model for optimal speed and reliability)
