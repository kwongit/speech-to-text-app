import { Locator, Page } from '@playwright/test';
import path from 'path';

export default class HomePage {
  // Class properties
  readonly page: Page;
  readonly mainHeader: Locator;
  readonly fileInput: Locator;
  readonly transcribeButton: Locator;
  readonly transcribingButton: Locator;
  readonly loadingSpinner: Locator;
  readonly transcriptionHeader: Locator;
  readonly transcriptionTextContainer: Locator;
  readonly copyButton: Locator;
  readonly downloadButton: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = page.getByRole('heading', { name: 'Upload an Audio File for Transcription' });
    this.fileInput = page.getByLabel('Upload audio file');
    this.transcribeButton = page.getByRole('button', { name: 'Transcribe' });
    this.transcribingButton = page.getByRole('button', { name: 'Transcribing' });
    this.loadingSpinner = page.locator('.mt-5.text-center');
    this.transcriptionHeader = page.getByRole('heading', { name: 'Transcription:' });
    this.transcriptionTextContainer = page.locator('.bg-gray-100.p-4.rounded.mt-2');
    this.copyButton = page.getByRole('button', { name: 'Copy' });
    this.downloadButton = page.getByRole('button', { name: 'Download' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });
  }

  async navigate() {
    await this.page.goto('/');
  }

  async uploadAudioFile(fileName: string) {
    const filePath = path.resolve(__dirname, `../data/${fileName}`);
    await this.fileInput.setInputFiles(filePath);
  }

  async transcribeAudioFile() {
    await this.transcribeButton.click();
  }

  async waitForTranscription() {
    await this.page.waitForResponse(response =>
      response.url().includes('/api/transcribe') && response.status() === 200
    );
  }

  async copyTranscriptionToClipboard() {
    await this.copyButton.click();
  }

  async downloadTranscription() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    return await downloadPromise;
  }
}
