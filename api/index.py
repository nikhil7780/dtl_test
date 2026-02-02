from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import base64
import traceback

# Get API key from environment
GENAI_API_KEY = os.environ.get("GENAI_API_KEY")

if not GENAI_API_KEY:
    print("WARNING: GENAI_API_KEY not found in environment variables.")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def call_gemini_api(prompt, content_parts):
    """
    Helper to call Gemini 2.5 Flash REST API.
    content_parts: list of dicts (text or inline_data)
    """
    if not GENAI_API_KEY:
        raise ValueError("API Key not set")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GENAI_API_KEY}"
    
    # Construct the payload
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                *content_parts
            ]
        }]
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        print(f"Gemini API Error: {response.status_code} - {response.text}")
        try:
            err_json = response.json()
            return None, err_json.get('error', {}).get('message', 'Unknown Error')
        except:
            return None, response.text

    try:
        data = response.json()
        text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        return text, None
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return None, str(e)

@app.route('/api/ocr', methods=['POST'])
def ocr_endpoint():
    return jsonify({'error': 'Offline OCR (Tesseract) is not supported in this cloud deployment. Please use the Sign Reader (Gemini) feature.'}), 501

@app.route('/api/transcribe', methods=['POST'])
def transcribe_endpoint():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        audio_bytes = audio_file.read()
        
        if len(audio_bytes) < 1000:
            return jsonify({'error': 'Audio too short'}), 400
        
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        print(f"Transcribing audio: {audio_file.filename} ({len(audio_bytes)} bytes)")
        
        # Determine mime type from filename
        mime_type = "audio/webm"
        filename = audio_file.filename.lower()
        if filename.endswith('.webm'):
            mime_type = "audio/webm"
        elif filename.endswith('.mp4') or filename.endswith('.m4a'):
            mime_type = "audio/mp4"
        elif filename.endswith('.wav'):
            mime_type = "audio/wav"
        elif filename.endswith('.ogg'):
            mime_type = "audio/ogg"
        elif filename.endswith('.flac'):
            mime_type = "audio/flac"
        
        print(f"Detected mime type: {mime_type}")
        
        prompt = "Transcribe this audio command. Output ONLY the spoken text, nothing else. Be concise."
        content_parts = [{
            "inline_data": {
                "mime_type": mime_type,
                "data": audio_b64
            }
        }]
        
        text, error = call_gemini_api(prompt, content_parts)
        
        if error:
            print(f"Transcription error: {error}")
            return jsonify({'error': error}), 500
            
        print(f"Transcription: {text}")
        return jsonify({'text': text})

    except Exception as e:
        print("Error transcribing:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze_sign', methods=['POST'])
def analyze_sign_endpoint():
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400

        # The image_data is already base64 without the data URI prefix
        encoded = image_data
            
        print("Analyzing sign with Gemini...")
        
        prompt = "EXTRACT TEXT ONLY. Look closely at the image. Read the big illuminated text on the signboard. Ignore background items. If it says 'RADIOLOGY', output 'Radiology'. Just the text."
        
        content_parts = [{
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": encoded
            }
        }]
        
        text, error = call_gemini_api(prompt, content_parts)

        if error:
            return jsonify({'error': error}), 500
            
        print(f"Sign Analysis: {text}")
        return jsonify({'text': text})

    except Exception as e:
        print("Error analyzing sign:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
