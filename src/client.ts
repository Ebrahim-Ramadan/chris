import { WhatsAppProtocol } from './protocol';

class WhatsAppClient extends EventTarget {
  private protocol: WhatsAppProtocol;

  constructor() {
    super();
    this.protocol = new WhatsAppProtocol('wss://web.whatsapp.com/ws');
  }

  async initialize(): Promise<void> {
    console.log('Starting initialization');
  }

  async disconnect(): Promise<void> {
    await this.protocol.disconnect();
  }
}

export default WhatsAppClient;