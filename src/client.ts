import { randomBytes } from 'crypto';
import { WhatsAppProtocol } from './protocol';
import type { WhatsAppOptions, Message, QRCode } from './types';

class WhatsAppClient extends EventTarget {
  private protocol: WhatsAppProtocol;
  private clientId: string;
  private session?: string;

  constructor(options: WhatsAppOptions = {}) {
    super();
    this.clientId = randomBytes(16).toString('base64');
    this.session = options.session;
    console.log('Creating WhatsAppClient with clientId:', this.clientId);
    this.protocol = new WhatsAppProtocol('wss://web.whatsapp.com/ws');
    this.setupProtocol();
  }

  private setupProtocol(): void {
    this.protocol.connect(
      (data) => this.handleMessage(data),
      () => this.handleOpen(),
      () => this.dispatchEvent(new CustomEvent('disconnected'))
    );
  }

  async initialize(): Promise<void> {
    console.log('Starting initialization');
    try {
      const response = await this.protocol.init();
      console.log('Init response:', response);
      if (response.status === 401 && response.qr) {
        this.dispatchEvent(new CustomEvent('qr', { detail: { code: response.qr } }));
      } else if (response.connected) {
        this.dispatchEvent(new CustomEvent('ready'));
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      throw error;
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected in client');
  }

  private handleMessage(data: any): void {
    console.log('Handling message:', data);
    if (data[0] === 'Msg') {
      const msg = data[1];
      const message: Message = {
        id: msg.id._serialized,
        from: msg.from,
        text: msg.body || 'Media message',
        timestamp: msg.t * 1000,
      };
      this.dispatchEvent(new CustomEvent('message', { detail: message }));
    }
  }

  async sendMessage(to: string, text: string): Promise<void> {
    const tag = this.protocol.generateTag();
    const msg = {
      cmd: 'action',
      type: 'chat',
      data: {
        to,
        text,
        id: `${tag}.${Date.now()}`,
      },
    };
    console.log('Sending message to:', to);
    await this.protocol.send(tag, msg);
  }

  async disconnect(): Promise<void> {
    await this.protocol.disconnect();
  }
}

export default WhatsAppClient;