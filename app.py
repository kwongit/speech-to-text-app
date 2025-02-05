from flask import Flask, request, jsonify, render_template
import requests
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get the API key from the environment variable
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload"
ASSEMBLYAI_TRANSCRIPT_URL = "https://api.assemblyai.com/v2/transcript"

# Homepage
@app.route("/")
def index():
    return render_template("index.html")

# Upload and transcribe audio
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Step 1: Upload the file to AssemblyAI
    headers = {"authorization": ASSEMBLYAI_API_KEY}
    upload_response = requests.post(ASSEMBLYAI_UPLOAD_URL, headers=headers, data=file)
    if upload_response.status_code != 200:
        return jsonify({"error": "Failed to upload file"}), 500

    audio_url = upload_response.json()["upload_url"]

    # Step 2: Submit transcription request
    transcript_response = requests.post(
        ASSEMBLYAI_TRANSCRIPT_URL,
        headers=headers,
        json={"audio_url": audio_url},
    )
    if transcript_response.status_code != 200:
        return jsonify({"error": "Failed to start transcription"}), 500

    transcript_id = transcript_response.json()["id"]

    # Step 3: Poll for transcription completion
    while True:
        status_response = requests.get(
            f"{ASSEMBLYAI_TRANSCRIPT_URL}/{transcript_id}", headers=headers
        )
        status = status_response.json()["status"]
        if status == "completed":
            return jsonify({"transcription": status_response.json()["text"]})
        elif status == "error":
            return jsonify({"error": "Transcription failed"}), 500
        time.sleep(5)  # Wait before polling again

if __name__ == "__main__":
    app.run(debug=True)
