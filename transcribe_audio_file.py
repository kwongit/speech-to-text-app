import os
import assemblyai as aai
from dotenv import load_dotenv
from collections import Counter
from tqdm import tqdm
import time

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

transcriber = aai.Transcriber()

audio_file = "/Users/kevin/Desktop/New Recording.m4a"

print(f"\n--- Processing file: {audio_file} ---")

config = aai.TranscriptionConfig(speaker_labels=True, sentiment_analysis=True)

# Start transcription
transcript = transcriber.transcribe(audio_file, config)

# Progress bar while waiting for transcription to complete
with tqdm(total=100, desc="Starting transcription", unit="%") as pbar:
    while transcript.status not in [aai.TranscriptStatus.completed, aai.TranscriptStatus.error]:
        time.sleep(1)  # Check status every second
        transcript = transcriber.get_transcript(transcript.id)
        pbar.update(10)  # Update progress bar (adjust as needed)

if transcript.status == aai.TranscriptStatus.error:
    print(f"Transcription failed: {transcript.error}")
    exit(1)

print("Transcription completed.")

# TODO: Add LLM to the transcript
# prompt = "Provide a brief summary of the transcript."

# result = transcript.lemur.task(
#     prompt, final_model=aai.LemurModel.claude3_5_sonnet
# )

# print(f"Summary of transcript: {result.response}")

def write_transcript_to_file(transcript, filename=f"{audio_file}_utterances.txt"):
    """
    Write the transcript to a file. Each utterance will be written with the speaker and the text.

    Args:
        transcript (Transcript): The transcript object.
        filename (str): The name of the file to write the transcript to. Defaults to "{audio_file}_utterances.txt".
    """
    with open(filename, "w") as f:
        f.write("Full Transcript:\n\n")
        for utterance in transcript.utterances:
            f.write(f'Speaker {utterance.speaker}: "{utterance.text}"\n\n')

write_transcript_to_file(transcript)

def calculate_speaker_duration_percentage(transcript):
    """
    Calculate the percentage of speaking time for each speaker.

    Args:
        transcript (Transcript): The transcript object.
    """
    speaker_duration = {}
    # Calculate total speaking time for each speaker
    for utterance in transcript.utterances:
        duration = utterance.end - utterance.start
        speaker_duration[utterance.speaker] = speaker_duration.get(utterance.speaker, 0) + duration

    total_duration = sum(speaker_duration.values())
    # Calculate and print percentages
    for speaker, duration in sorted(speaker_duration.items()):
        percentage = round(duration / total_duration * 100)
        print(f"Speaker {speaker} spoke for {percentage}% of the time.")

print("\n--- Speaker Duration Percentages ---")
calculate_speaker_duration_percentage(transcript)

def calculate_overall_sentiment(transcript):
    """
    Calculate the overall sentiment for each speaker.

    Args:
        transcript (Transcript): The transcript object.
    """
    speaker_sentiment = {}
    # Collect sentiments for each speaker
    for sentiment_result in transcript.sentiment_analysis:
        speaker_sentiment.setdefault(sentiment_result.speaker, []).append(sentiment_result.sentiment)

    # Determine overall sentiment for each speaker
    for speaker, sentiments in sorted(speaker_sentiment.items()):
        sentiment_counts = Counter(sentiments)
        max_count = max(sentiment_counts.values())

        most_freq_sentiments = [sentiment.lower() for sentiment, count in sentiment_counts.items() if count == max_count]

        overall_sentiment = " and ".join(most_freq_sentiments)

        if len(most_freq_sentiments) > 1:
            print(f"The overall sentiment for Speaker {speaker} was equally {overall_sentiment}.")
        else:
            print(f"The overall sentiment for Speaker {speaker} was {overall_sentiment}.")

print("\n--- Speaker Overall Sentiments ---")
calculate_overall_sentiment(transcript)
