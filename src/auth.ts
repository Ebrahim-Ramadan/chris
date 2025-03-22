import qrcode from 'qrcode-terminal';
import type WhatsAppClient from './client';

export class Auth {
  private client: WhatsAppClient;

  constructor(client: WhatsAppClient) {
    this.client = client;
    // Don't access page here; defer to methods
  }

  private get page(): import('puppeteer').Page {
    return this.client.getPage();
  }

  async checkAuthentication(): Promise<boolean> {
    const mainSelector = '#side';
    return await this.page.evaluate((selector) => !!document.querySelector(selector), mainSelector);
  }

  async authenticate(): Promise<void> {
    try {
      await this.page.waitForSelector('canvas', { timeout: 60000 });
      const qrData = await this.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return canvas ? canvas.toDataURL() : null;
      });

      if (qrData) {
        this.client.dispatchEvent(new CustomEvent('qr', { detail: qrData }));
        qrcode.generate(qrData.split(',')[1], { small: true });
        console.log('Scan the QR code with your WhatsApp app');
      }

      await this.page.waitForSelector('#side', { timeout: 60000 });
      console.log('Authentication successful!');
    } catch (error) {
      throw new Error(`Authentication failed: ${(error as Error).message}`);
    }
  }
}