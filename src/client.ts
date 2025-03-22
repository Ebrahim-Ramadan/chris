import { randomBytes } from 'crypto';
import { WhatsAppProtocol } from './protocol';
import type { WhatsAppOptions } from './types';

class WhatsAppClient extends EventTarget {
  private protocol: WhatsAppProtocol;
  private clientId: string;

  constructor(options: WhatsAppOptions = {}) {
    super();
    this.clientId = randomBytes(16).toString('base64');
    console.log('Creating WhatsAppClient with clientId:', this.clientId);
    this.protocol = new WhatsAppProtocol('wss://web.whatsapp.com/ws/chat');
  }

  async initialize(): Promise<void> {
    console.log('Starting initialization');
    try {
      const response = await this.protocol.init(this.clientId);
      console.log('Init response:', response);
      this.dispatchEvent(new CustomEvent('ready'));
    } catch (error) {
      console.error('Initialization failed:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.protocol.disconnect();
  }
}

export default WhatsAppClient;