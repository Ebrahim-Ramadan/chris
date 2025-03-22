import { randomBytes } from 'crypto';

export class WhatsAppProtocol {
  private ws: WebSocket;
  private tagCounter: number = 0;
  private pending: Map<string, (data: any) => void> = new Map();
  private isOpen: Promise<void>;

  constructor(url: string) {
    console.log('Initializing WebSocket to:', url);
    this.ws = new WebSocket(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://web.whatsapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Sec-WebSocket-Version': '13',
        'Sec-WebSocket-Extensions': 'permessage-deflate',
      },
    });

    this.isOpen = new Promise((resolve) => {
      this.ws.onopen = () => {
        console.log('WebSocket opened');
        resolve();
      };
    });

    this.isOpen = Promise.race([
      this.isOpen,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WebSocket connection timed out')), 10000)
      ),
    ]);

    this.ws.onmessage = (event) => console.log('WebSocket message:', event.data);
    this.ws.onclose = (event) => console.log('WebSocket closed:', event.code, event.reason);
    this.ws.onerror = (err) => console.error('WebSocket error:', err);
  }

  async send(tag: string, data: any): Promise<any> {
    await this.isOpen;
    const message = `${tag},${JSON.stringify(data)}`;
    console.log('Sending message:', message);
    this.ws.send(message);
    return new Promise((resolve) => this.pending.set(tag, resolve));
  }

  generateTag(): string {
    return `${Date.now()}.${++this.tagCounter}`;
  }

  async init(clientId: string): Promise<any> {
    const tag = this.generateTag();
    const initMsg = [
      'admin',
      'init',
      '2.2412.54',
      ['Bun', 'WhatsApp-Lib', '1.0'],
      clientId,
      true,
    ];
    return this.send(tag, initMsg);
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.ws.close();
  }
}