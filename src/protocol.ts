import { randomBytes } from 'crypto';

const WA_VERSION = '2.2412.54';
const CLIENT_ID = randomBytes(16).toString('base64');

export class WhatsAppProtocol {
  private ws: WebSocket;
  private tagCounter: number = 0;
  private pending: Map<string, (data: any) => void> = new Map();
  private isOpen: Promise<void>;

  constructor(url: string) {
    console.log('Initializing WebSocket to:', url);
    this.ws = new WebSocket(url, {
      headers: {
        'Origin': 'https://web.whatsapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bun/1.2.2',
      },
    });

    this.isOpen = new Promise((resolve) => {
      this.ws.onopen = () => {
        console.log('WebSocket opened');
        resolve();
      };
    });

    // Add timeout to detect connection failure
    this.isOpen = Promise.race([
      this.isOpen,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WebSocket connection timed out')), 10000)
      ),
    ]);
  }

  connect(onMessage: (data: any) => void, onOpen: () => void, onClose: () => void): void {
    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      onOpen();
    };
    this.ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const [tag, data] = this.parseMessage(event.data.toString());
      if (this.pending.has(tag)) {
        this.pending.get(tag)!(data);
        this.pending.delete(tag);
      } else {
        onMessage(data);
      }
    };
    this.ws.onclose = () => {
      console.log('WebSocket closed');
      onClose();
    };
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

  private parseMessage(raw: string): [string, any] {
    const [tag, ...rest] = raw.split(',');
    const data = JSON.parse(rest.join(','));
    return [tag, data];
  }

  async init(): Promise<any> {
    const tag = this.generateTag();
    const initMsg = [
      'admin',
      'init',
      WA_VERSION,
      ['Bun', 'WhatsApp-Lib', '1.0'],
      CLIENT_ID,
      true,
    ];
    console.log('Initializing with:', initMsg);
    return this.send(tag, initMsg);
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.ws.close();
  }
}