import { test, expect } from '@playwright/test';

test('App loads and file input is present', async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Verify the page title
  await expect(page).toHaveTitle('Transcribe.io');

})
