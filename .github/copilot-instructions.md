# AI Coding Agent Instructions - Voice Assistant for Visually Impaired

## Architecture Overview

This is a **voice-first web application** with a clear separation of concerns:

- **Frontend (React + Vite)**: Client-side voice interaction, real-time UI feedback, camera/microphone access
- **Backend (Flask)**: API gateway for AI services (Gemini for transcription, sign analysis, OCR)
- **Communication**: REST API via `/api/*` endpoints; frontend uses `VITE_API_URL` environment variable

### Key Data Flow
1. User speaks → VoiceContext captures audio → sends to backend `/api/transcribe`
2. Backend uses Gemini API to transcribe audio → returns text to frontend
3. App.jsx detects global commands (e.g., "Go to Form") and routes accordingly
4. Page components (VoiceForm, SignReader, etc.) use same voice pipeline for module-specific interactions

## Critical Developer Workflows

### Development
```bash
npm install                    # Install frontend dependencies
npm run dev                   # Run Vite dev server (http://localhost:5173)
# In separate terminal:
cd backend && python app.py   # Run Flask backend (http://localhost:5000)
```

### Deployment
- **Frontend**: Vercel (automatically built from git)
- **Backend**: Railway (auto-detects Python project)
- **Key Step**: Set `VITE_API_URL=https://your-railway-backend.railway.app` in production build

### Configuration
- **Frontend**: Uses `import.meta.env.VITE_API_URL` to connect to backend
- **Backend**: Requires `GENAI_API_KEY` environment variable (Google Gemini API key)
- **Vite Config**: Proxies `/api/*` to backend during development

## Project-Specific Patterns

### 1. Voice Context Pattern (VoiceContext.jsx)
- Centralized voice state management via React Context
- Exposes: `transcript`, `listening`, `speak()`, `startListening()`, `resetTranscript()`
- **Important**: Manages both Web Speech API (Chrome/desktop) and fallback audio-upload mode (iOS/Safari)
- Components import with: `const { transcript, speak } = useVoice();`

### 2. Global Navigation (App.jsx)
- Listens to transcript changes globally
- Matches phrases like "Go to Form", "Go to Queue", "Go to Map", "Read Sign", "Go Home"
- Routes to pages: `/form`, `/queue`, `/qr`, `/signs`, `/`
- Always call `resetTranscript()` after processing command to avoid re-triggering

### 3. Module-Specific Form Filling (VoiceForm.jsx)
- Uses step-by-step confirmation pattern: asks question → waits 2 seconds silence → confirms answer
- User says "Yes"/"No" to confirm input
- Stores responses in `formData` state object
- Pattern: `setTranscript()` → silence timer (2s) → `handleInput()` → confirmation flow

### 4. Backend API Endpoints
All endpoints accept POST requests and return JSON:

- **`/api/transcribe`**: Multipart form with audio file → Gemini transcription
  - Accepts `.webm`, `.mp4`, `.wav`, `.ogg`, `.flac`
  - Returns: `{ text: "transcribed text" }` or `{ error: "message" }`

- **`/api/analyze_sign`**: JSON body with base64 image data → Gemini vision analysis
  - Input: `{ image: "data:image/jpeg;base64,..." }`
  - Returns: `{ text: "extracted text from sign" }` or `{ error: "message" }`

- **`/api/ocr`**: Returns 501 error (not supported in cloud deployment)

### 5. Audio Handling
- Frontend: `html5-qrcode` for QR scanning, `react-webcam` for camera, `react-speech-recognition` for Web Speech API
- VoiceContext handles both live recognition and audio file upload fallback
- Audio chunks collected, then POSTed as multipart FormData to backend

## Critical Integration Points

### Gemini API Integration
- Uses REST API (not SDK) for easier deployment compatibility
- Base64 encodes audio/images before sending
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Note**: Requires proper MIME types (audio/webm, audio/mp4, image/jpeg) for content parts

### Environment Variables
- **`VITE_API_URL`**: Frontend → backend connection (set in `.env.production`)
- **`GENAI_API_KEY`**: Backend → Gemini API authentication (Railway environment)
- Both required for production; use defaults for local dev

## Important Conventions

1. **Error Handling**: Voice errors are spoken aloud via `speak()` and displayed in UI status messages
2. **Silence Detection**: 2-second timeout for form inputs; Web Speech API handles streaming
3. **Mobile Fallback**: App detects Safari/iOS and uses audio upload mode instead of Web Speech API
4. **CORS**: Flask app enables CORS for all origins (`CORS(app, resources={r"/*": {"origins": "*"}})`)
5. **Status Updates**: VoiceContext maintains `status` state (e.g., "Listening", "Too quiet", "Server error")

## Common Modifications

### Adding a New Voice Command
1. Add phrase detection in App.jsx `transcript.toLowerCase().includes('your phrase')`
2. Call `resetTranscript()`, `speak()` feedback, then `navigate()`

### Adding New Form Field
1. Add object to `steps` array in VoiceForm.jsx
2. Field ID becomes the key in `formData` state

### Adding New Page
1. Create page component in `src/pages/`
2. Import in App.jsx and add Route
3. Implement voice interactions using `useVoice()` hook

## File Structure Reference
- **`src/context/VoiceContext.jsx`**: Core voice pipeline (read-only; complex state management)
- **`src/App.jsx`**: Global routing and command detection
- **`src/pages/`**: Feature modules (VoiceForm, SignReader, QueueStatus, QRNavigation, Home)
- **`backend/app.py`**: Flask server with Gemini API integration
- **`vite.config.js`**: Development server proxy setup

