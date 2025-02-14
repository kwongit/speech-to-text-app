import { test, expect } from '@playwright/test';

test('App loads and file input is present', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

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
});
