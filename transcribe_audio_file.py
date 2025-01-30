import os
import assemblyai as aai
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")
transcriber = aai.Transcriber()
transcriber

audio_file = "/Users/kevin/Documents/App Academy/Job Search/Interview Recordings/Writer/writer_qaae_recruiter.MOV"

# audio_file = "/Users/kevin/Documents/App Academy/Job Search/Interview Recordings/Bold Metrics/boldmetrics_sdet_eng_dir.MOV"

# audio_file = "/Users/kevin/Documents/App Academy/Job Search/Interview Recordings/Hungryroot/hungryroot_aaron.MOV"

# audio_file = "/Users/kevin/Desktop/New Recording.m4a"

print(f"Processing file: {audio_file}")
config = aai.TranscriptionConfig(speaker_labels=True, sentiment_analysis=True)
transcript = transcriber.transcribe(audio_file, config)

if transcript.status == aai.TranscriptStatus.error:
    print(f"Transcription failed: {transcript.error}")
    exit(1)

print(f"Transcription completed for: {audio_file}")

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
