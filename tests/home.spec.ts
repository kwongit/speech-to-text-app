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
  const mainHeadingText = 'Upload an Audio File for Transcription';
  const mainHeading = page.getByRole('heading', { name: mainHeadingText });
  await expect(mainHeading).toBeVisible();
  await expect(mainHeading).toHaveText(mainHeadingText);

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

  // Verify path of uploaded file

  // Verify the button initially says "Transcribe"
  const transcribeButton = page.getByRole('button', { name: 'Transcribe' });
  await expect(transcribeButton).toHaveText('Transcribe');

  // Click the transcribe button
  await transcribeButton.click();

  // Verify the button text changes to "Transcribing..."
  const transcribingButton = page.getByRole('button', { name: 'Transcribing' });
  await expect(transcribingButton).toHaveText("Transcribing...");

  // Verify the loading spinner and message are visible
  const transcriptionInProgressText = 'Transcribing your audio... This may take a moment.';
  await expect(page.locator('.mt-5.text-center')).toBeVisible();
  await expect(page.getByText(transcriptionInProgressText)).toBeVisible();

  // TODO: figure out how to wait for the transcription to complete
  // Wait for the transcription to complete
  await page.waitForSelector('.bg-gray-100');

  // Verify the button text changes back to "Transcribe"
  await expect(transcribeButton).toHaveText('Transcribe');
  await expect(page.getByRole('heading', { name: 'Transcription:' })).toBeVisible();
});
