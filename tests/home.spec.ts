import { test, expect } from '@playwright/test';
import HomePage from './pages/home-page';

test.describe('Transcribe App', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('App loads and file input is present', async () => {
    // Verify the page URL
    await expect(homePage.page).toHaveURL('/');

    // Verify the page title
    await expect(homePage.page).toHaveTitle('Transcribe.io');

    // Verify the h1 tag is visible and has the correct text
    await expect(homePage.mainHeader).toBeVisible();

    // Verify the file input and transcribe button are present
    await expect(homePage.fileInput).toBeVisible();
    await expect(homePage.transcribeButton).toBeVisible();

    // Verify the file input accepts audio files
    await expect(homePage.fileInput).toHaveAttribute('accept', 'audio/*');
  });

  test('Upload audio file and verify transcription', async () => {
    // Upload the test audio file
    await homePage.uploadAudioFile('test-recording.m4a');

    // Verify the button initially says "Transcribe"
    await expect(homePage.transcribeButton).toHaveText('Transcribe');

    // Click the transcribe button
    await homePage.transcribeAudioFile();

    // Verify the button text changes to "Transcribing..."
    await expect(homePage.transcribingButton).toHaveText('Transcribing...');

    // Verify the loading spinner and message are visible
    await expect(homePage.loadingSpinner).toBeVisible();
    const transcriptionInProgressText = 'Transcribing your audio... This may take a moment.';
    await expect(homePage.page.getByText(transcriptionInProgressText)).toBeVisible();

    // Wait for the API response
    await homePage.waitForTranscription();

    // Verify the button text changes back to "Transcribe" after transcription
    await expect(homePage.transcribeButton).toHaveText('Transcribe');

    // Verify the transcription header is visible
    await expect(homePage.transcriptionHeader).toBeVisible();

    // Verify the transcription text is visible
    await expect(homePage.transcriptionTextContainer).toBeVisible();
    await expect(homePage.transcriptionTextContainer).not.toBeEmpty();

    const transcriptionTextContent = 'Speaker A: Hi. This is a test.';
    await expect(homePage.transcriptionTextContainer).toContainText(transcriptionTextContent);

    // Verify action buttons are present
    await expect(homePage.copyButton).toBeVisible();
    await expect(homePage.downloadButton).toBeVisible();
    await expect(homePage.clearButton).toBeVisible();
  });

  test('Copy transcription to clipboard', async () => {
    // Mock the clipboard writeText method
    await homePage.page.evaluate(() => {
      navigator.clipboard.writeText = async (text: string) => {
        (window as { __mockClipboard__?: string }).__mockClipboard__ = text;
      };
      navigator.clipboard.readText = async () => {
        return (window as { __mockClipboard__?: string }).__mockClipboard__ || '';
      };
    });

    // Upload and transcribe audio file
    await homePage.uploadAudioFile('test-recording.m4a');
    await homePage.transcribeAudioFile();

    // Wait for the API response
    await homePage.waitForTranscription();

    // Copy the transcription to the clipboard
    await homePage.copyTranscriptionToClipboard();

    // Verify the 'Copied!' message is displayed
    await expect(homePage.page.getByText('Copied!')).toBeVisible();

    // Verify the clipboard contains the transcription text
    const clipboardText = await homePage.page.evaluate(() => navigator.clipboard.readText());
    const transcriptionText = await homePage.transcriptionTextContainer.innerText();
    const normalizedClipboardText = clipboardText.trim().replace(/\s+/g, ' ');
    const normalizedTranscriptionText = transcriptionText.trim().replace(/\s+/g, ' ');
    expect(normalizedClipboardText).toBe(normalizedTranscriptionText);
  });

  test('Download transcription file as text file', async () => {
    // Upload and transcribe audio file
    await homePage.uploadAudioFile('test-recording.m4a');
    await homePage.transcribeAudioFile();

    // Wait for the API response
    await homePage.waitForTranscription();

    // Download the transcription text as a file
    const download = await homePage.downloadTranscription();

    // Verify the downloaded file name
    const fileName = 'test-recording_utterances.txt';
    expect(download.suggestedFilename()).toBe(fileName);
  })

  // TODO:
  // Test the "Clear" button functionality.
  // Test error handling (e.g., uploading an invalid file).

});
