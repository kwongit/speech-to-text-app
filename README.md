# Audio Transcription App

This is a Next.js application that allows users to upload audio files and transcribe them using the AssemblyAI API. The app supports speaker diarization, which identifies different speakers in the audio, and provides options to copy or download the transcription.

## Live Demo

Check out the live demo of the app here: [https://transcribe-io.vercel.app/](https://transcribe-io.vercel.app/)

## Features

- **Upload Audio Files**: Upload audio files in supported formats (e.g., MP3, WAV, FLAC).
- **Transcription with Speaker Labels**: Automatically identifies and labels different speakers in the transcription.
- **Copy Transcription**: Copy the transcription to the clipboard with a single click.
- **Download Transcription**: Download the transcription as a `.txt` file.
- **Clear Results**: Clear the uploaded file and transcription results.

## Technologies Used

- **Next.js**: A React framework for building server-rendered applications.
- **AssemblyAI API**: Used for audio transcription and speaker diarization.
- **React Spinners**: Provides a loading spinner for better user experience.
- **Tailwind CSS**: Used for styling the application.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- An AssemblyAI API key (get it from [AssemblyAI Dashboard](https://app.assemblyai.com/))

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/audio-transcription-app.git
   cd audio-transcription-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your AssemblyAI API key:

   ```env
   NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open the app**:
   Visit `http://localhost:3000` in your browser to use the app.

## Usage

1. **Upload an Audio File**:

   - Click the "Choose File" button to select an audio file from your device.
   - Supported formats: MP3, WAV, FLAC, etc.

2. **Transcribe the Audio**:

   - Click the "Transcribe" button to start the transcription process.
   - The app will display a loading spinner while processing the audio.

3. **View the Transcription**:

   - Once the transcription is complete, the results will be displayed on the page.
   - If speaker diarization is enabled, the transcription will include speaker labels (e.g., "Speaker 1", "Speaker 2").

4. **Copy or Download the Transcription**:

   - Use the "Copy" button to copy the transcription to your clipboard.
   - Use the "Download" button to download the transcription as a `.txt` file.

5. **Clear the Results**:
   - Use the "Clear" button to reset the app and upload a new file.

## Code Overview

### `app/page.tsx`

This is the main page of the application. It includes:

- A file upload form.
- Logic for handling file uploads and transcription requests.
- Display of transcription results with speaker labels.
- Buttons for copying, downloading, and clearing the transcription.

### `app/api/transcribe/route.ts`

This API route handles the transcription process. It:

- Uploads the audio file to AssemblyAI.
- Submits a transcription request with speaker diarization enabled.
- Polls the AssemblyAI API for the transcription status.
- Returns the transcription results to the frontend.

## Deployment

To deploy this application, you can use platforms like:

- **Vercel**: The easiest way to deploy a Next.js app.
- **Netlify**: Another great option for deploying static sites and serverless functions.
- **AWS Amplify**: For deploying full-stack applications.
