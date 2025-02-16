import { Locator, Page } from '@playwright/test';
import path from 'path';

export default class HomePage {
  readonly page: Page;
  readonly mainHeader: Locator;
  readonly fileInput: Locator;
  readonly transcribeButton: Locator;
  readonly transcribingButton: Locator;
  readonly loadingSpinner: Locator;
  readonly transcriptionInProgressText: string;
  readonly transcriptionHeader: Locator;
  readonly transcriptionTextContainer: Locator;
  readonly transcriptionTextContent: string;
  readonly copyButton: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = page.getByRole('heading', { name: 'Upload an Audio File for Transcription' });
    this.fileInput = page.getByLabel('Upload audio file');
    this.transcribeButton = page.getByRole('button', { name: 'Transcribe' });
    this.transcribingButton = page.getByRole('button', { name: 'Transcribing' });
    this.loadingSpinner = page.locator('.mt-5.text-center');
    this.transcriptionInProgressText = 'Transcribing your audio... This may take a moment.';
    this.transcriptionHeader = page.getByRole('heading', { name: 'Transcription:' });
    this.transcriptionTextContainer = page.locator('.bg-gray-100.p-4.rounded.mt-2');
    this.transcriptionTextContent = 'Speaker A: Hi. This is a test.';
    this.copyButton = page.getByRole('button', { name: 'Copy' });
    this.downloadButton = page.getByRole('button', { name: 'Download' });
  }

  // TODO: Add methods to interact with the page
}
