import { randomBytes } from 'crypto';

// WhatsApp Web protocol constants
const WA_VERSION = '2.2412.54'; // Update this based on WhatsApp Web version
const CLIENT_ID = randomBytes(16).toString('base64');

export class WhatsAppProtocol {
  private ws: WebSocket;
  private tagCounter: number = 0;
  private pending: Map<string, (data: any) => void> = new Map();

  constructor(url: string) {
    this.ws = new WebSocket(url, {
      headers: {
        'Origin': 'https://web.whatsapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bun/1.2.2',
      },
    });
  }

  connect(onMessage: (data: any) => void, onOpen: () => void, onClose: () => void): void {
    this.ws.onopen = onOpen;
    this.ws.onmessage = (event) => {
      const [tag, data] = this.parseMessage(event.data.toString());
      if (this.pending.has(tag)) {
        this.pending.get(tag)!(data);
        this.pending.delete(tag);
      } else {
        onMessage(data);
      }
    };
    this.ws.onclose = onClose;
    this.ws.onerror = (err) => console.error('WebSocket error:', err);
  }

  send(tag: string, data: any): Promise<any> {
    const message = `${tag},${JSON.stringify(data)}`;
    this.ws.send(message);
    return new Promise((resolve) => this.pending.set(tag, resolve));
  }

  generateTag(): string {
    return `${Date.now()}.${++this.tagCounter}`;
  }

  private parseMessage(raw: string): [string, any] {
    const [tag, ...rest] = raw.split(',');
    const data = JSON.parse(rest.join(','));
    return [tag, data];
  }

  // Initial connection message
  init(): Promise<any> {
    const tag = this.generateTag();
    const initMsg = [
      'admin',
      'init',
      WA_VERSION,
      ['Bun', 'WhatsApp-Lib', '1.0'],
      CLIENT_ID,
      true,
    ];
    return this.send(tag, initMsg);
  }

  disconnect(): void {
    this.ws.close();
  }
}