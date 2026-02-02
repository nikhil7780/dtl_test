import os
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Trying to read GENAI_API_KEY from environment only.")

api_key = os.environ.get("GENAI_API_KEY")

if not api_key:
    print("No key found in env. Please set GENAI_API_KEY environment variable.")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Available Models:")
        for m in models:
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(f"- {m['name']}")
    else:
        print(f"Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Error: {e}")
