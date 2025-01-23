# AssemblyAI - Speaker Diarization and Sentiment Analysis

## Overview

This Python backend application uses the AssemblyAI API to transcribe an audio file from a URL, generates a text file identifying speakers, and summarizes speaker insights and sentiment analysis in the terminal. The application performs:

- Speaker Diarization: Identifying and labeling different speakers in the audio.
- Sentiment Analysis: Analyzing the overall sentiment (e.g., positive, negative, neutral) of each speaker.

The application outputs a full transcript with speaker labels to a text file (`utterances.txt`) and logs speaker duration percentages and sentiment summaries to the terminal.

## Setup Instructions

1. Install dependencies: Use `pip` to install the required dependencies:
   ```bash
   pip install assemblyai python-dotenv
   ```
2. Set Up the API Key: Create a .env file in the same directory as the script and add your AssemblyAI API key:
   ```env
   ASSEMBLYAI_API_KEY="your_api_key_here"
   ```
3. Run the Application: Execute the script in your terminal:
   ```bash
   python transcribe_audio_file.py
   ```
   The script will transcribe the audio, output the full transcript, speaker labels, and sentiment analysis to the terminal, and save the full transcript to a text file named `utterances.txt`.

## Sample Output

When using the provided example audio, the script will log the following to the terminal:

```bash
Transcription completed for: https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3

--- Speaker Duration Percentages ---
Speaker A spoke for 35% of the time.
Speaker B spoke for 65% of the time.

--- Speaker Overall Sentiments ---
The overall sentiment for Speaker A was neutral.
The overall sentiment for Speaker B was neutral.
```

The generated `utterances.txt` file will contain:

```bash
Full Transcript:

Speaker A: "Smoke from hundreds of wildfires in Canada is triggering air quality alerts throughout the US Skylines from Maine to Maryland to Minnesota are gray and smoggy. And in some places, the air quality warnings include the warning to stay inside. We wanted to better understand what's happening here and why, so we called Peter DeCarlo, an associate professor in the Department of Environmental Health and Engineering at Johns Hopkins University. Good morning, Professor."

Speaker B: "Good morning."
...
```

## Customization

Audio File: To transcribe a different file, replace the value of the audio_file variable in the script with a URL or local file path.

## Troubleshooting

- Make sure the `.env` file is in the same directory as the `transcribe_audio_file.py` script.
- Verify that your API key is correct and active.
- Confirm that the assemblyai and python-dotenv packages are installed.
- If using a local file, ensure the file path is correct and accessible.
- Check the terminal for detailed error messages if the script fails.
