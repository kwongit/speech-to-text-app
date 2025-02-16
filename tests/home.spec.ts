import { test, expect } from '@playwright/test';
import path from 'path';

test('App loads and file input is present', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Verify the page URL
  await expect(page).toHaveURL('/');

  // Verify the page title
  await expect(page).toHaveTitle('Transcribe.io');

  // Verify the h1 tag is visible and has the correct text
  const mainHeading = page.getByRole('heading', { name: 'Upload an Audio File for Transcription' });
  await expect(mainHeading).toBeVisible();

  // Verify the file input and transcribe button are present
  const fileInput = page.getByLabel('Upload audio file');
  const transcribeButton = page.getByRole('button', { name: 'Transcribe' });
  await expect(fileInput).toBeVisible();
  await expect(transcribeButton).toBeVisible();

  // Verify the file input accepts audio files
  await expect(fileInput).toHaveAttribute('accept', 'audio/*');
});

test('Upload audio file and verify transcription', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Upload the test audio file
  const filePath = path.resolve(__dirname, './data/test-recording.m4a');
  const fileInput = page.getByLabel('Upload audio file');
  await fileInput.setInputFiles(filePath);

  // Verify the button initially says "Transcribe"
  const transcribeButton = page.getByRole('button', { name: 'Transcribe' });
  await expect(transcribeButton).toHaveText('Transcribe');

  // Click the transcribe button
  await transcribeButton.click();

  // Verify the button text changes to "Transcribing..."
  const transcribingButton = page.getByRole('button', { name: 'Transcribing' });
  await expect(transcribingButton).toHaveText("Transcribing...");

  // Verify the loading spinner and message are visible
  const loadingSpinner = page.locator('.mt-5.text-center');
  await expect(loadingSpinner).toBeVisible();

  const transcriptionInProgressText = 'Transcribing your audio... This may take a moment.';
  await expect(page.getByText(transcriptionInProgressText)).toBeVisible();

  // Wait for the API response
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/transcribe') && response.status() === 200
  );
  await responsePromise;

  // Verify the button text changes back to "Transcribe"
  await expect(transcribeButton).toHaveText('Transcribe');

  // Verify the transcription heading is visible
  const transcriptionHeading = page.getByRole('heading', { name: 'Transcription:' });
  await expect(transcriptionHeading).toBeVisible();

  // Verify the transcription text is visible
  const transcriptionText = page.locator('.bg-gray-100');
  await expect(transcriptionText).toBeVisible();
  await expect(transcriptionText).not.toBeEmpty();

  const transcriptionTextContent = 'Speaker A: Hi. This is a test.';
  await expect(transcriptionText).toContainText(transcriptionTextContent);

  // Verify copy to clipboard button is present
  await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();

  // Verify download button is present
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

  // Verify clear button is present
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
});

test('Copy transcription to clipboard', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Mock the clipboard
  await page.evaluate(() => {
    navigator.clipboard.writeText = async (text: string) => {
      (window as { __mockClipboard__?: string }).__mockClipboard__ = text;
    };
    navigator.clipboard.readText = async () => {
      return (window as { __mockClipboard__?: string }).__mockClipboard__ || '';
    };
  });

  // Upload the test audio file
  const filePath = path.resolve(__dirname, './data/test-recording.m4a');
  const fileInput = page.getByLabel('Upload audio file');
  await fileInput.setInputFiles(filePath);

  // Click the transcribe button
  const transcribeButton = page.getByRole('button', { name: 'Transcribe' });
  await transcribeButton.click();

  // Wait for the API response
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/transcribe') && response.status() === 200
  );
  await responsePromise;

  // Click the copy button
  const copyButton = page.getByRole('button', { name: 'Copy' });
  await copyButton.click();

  // Verify the "Copied!" message appears
  const copiedMessage = page.getByText('Copied!');
  await expect(copiedMessage).toBeVisible();

  // Verify the clipboard contains the transcription text
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  const transcriptionText = await page.locator('.bg-gray-100').innerText();
  const normalizedClipboardText = clipboardText.trim().replace(/\s+/g, ' ');
  const normalizedTranscriptionText = transcriptionText.trim().replace(/\s+/g, ' ');
  expect(normalizedClipboardText).toBe(normalizedTranscriptionText);
});

test('Download transcription as text file', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Upload the test audio file
  const filePath = path.resolve(__dirname, './data/test-recording.m4a');
  const fileInput = page.getByLabel('Upload audio file');
  await fileInput.setInputFiles(filePath);

  // Click the transcribe button
  const transcribeButton = page.getByRole('button', { name: 'Transcribe' });
  await transcribeButton.click();

  // Wait for the API response
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/transcribe') && response.status() === 200
  );
  await responsePromise;

  // Click the download button
  const downloadPromise = page.waitForEvent('download'); // Wait for the download to start
  const downloadButton = page.getByRole('button', { name: 'Download' });
  await downloadButton.click();
  const download = await downloadPromise;

  // Verify the downloaded file name
  const fileName = 'test-recording_utterances.txt';
  expect(download.suggestedFilename()).toBe(fileName);
});

// TODO:
// refactor
// additional test scenarios:
// Test the "Clear" button functionality.
// Test error handling (e.g., uploading an invalid file).
