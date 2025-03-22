import type WhatsAppClient from './client';
import type { Message } from './types';

export class Messaging {
  private client: WhatsAppClient;

  constructor(client: WhatsAppClient) {
    this.client = client;
    // Don't access page here; defer to methods
  }

  private get page(): import('puppeteer').Page {
    return this.client.getPage();
  }

  async sendMessage(to: string, text: string): Promise<{ success: boolean; to: string; text: string }> {
    try {
      await this.page.evaluate(
        (to, text) => {
          const chatSelector = `[title="${to}"]`;
          const chat = document.querySelector(chatSelector);
          if (!chat) throw new Error(`Chat with ${to} not found`);
          chat.click();

          const inputSelector = 'div[contenteditable="true"][data-tab="10"]';
          const input = document.querySelector(inputSelector);
          if (!input) throw new Error('Message input not found');

          input.textContent = text;
          input.dispatchEvent(new Event('input', { bubbles: true }));

          const sendButton = document.querySelector('button[aria-label="Send"]');
          if (!sendButton) throw new Error('Send button not found');
          sendButton.click();
        },
        to,
        text
      );
      return { success: true, to, text };
    } catch (error) {
      this.client.dispatchEvent(new CustomEvent('error', { detail: error }));
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  async startMessageListener(): Promise<void> {
    await this.page.exposeFunction('onMessageReceived', (message: Message) => {
      this.client.dispatchEvent(new CustomEvent('message', { detail: message }));
    });

    await this.page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node: any) => {
            if (node.classList?.contains('message-in')) {
              const text = node.querySelector('.copyable-text')?.innerText || 'Media message';
              const from = node.querySelector('[data-pre-plain-text]')?.innerText || 'Unknown';
              window.onMessageReceived({ from, text, timestamp: Date.now() });
            }
          });
        });
      });
      observer.observe(document.querySelector('#main') || document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
}