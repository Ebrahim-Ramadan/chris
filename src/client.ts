import * as puppeteer from 'puppeteer';
import { Auth } from './auth';
import { Messaging } from './messaging';
import type { WhatsAppOptions } from './types';

// Bun's built-in EventTarget equivalent
class WhatsAppClient extends EventTarget {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  public auth: Auth;
  public messaging: Messaging;
  private options: WhatsAppOptions;

  constructor(options: WhatsAppOptions = {}) {
    super();
    this.options = { headless: true, userDataDir: './whatsapp-session', ...options };
    this.auth = new Auth(this);
    this.messaging = new Messaging(this);
  }

  getPage(): puppeteer.Page {
    if (!this.page) throw new Error('Client not initialized');
    return this.page;
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        userDataDir: this.options.userDataDir, // Persistent session
      });
      this.page = await this.browser.newPage();
      await this.page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });

      const isAuthenticated = await this.auth.checkAuthentication();
      if (!isAuthenticated) {
        await this.auth.authenticate();
      }

      this.dispatchEvent(new CustomEvent('ready'));
      this.setupListeners();
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      throw new Error(`Initialization failed: ${(error as Error).message}`);
    }
  }

  private async setupListeners(): Promise<void> {
    await this.messaging.startMessageListener();
  }

  async sendMessage(to: string, text: string): Promise<{ success: boolean; to: string; text: string }> {
    return this.messaging.sendMessage(to, text);
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.dispatchEvent(new CustomEvent('disconnected'));
    }
  }
}

export default WhatsAppClient;