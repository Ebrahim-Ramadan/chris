export class WhatsAppProtocol {
  private ws: WebSocket;

  constructor(url: string) {
    console.log('Initializing WebSocket to:', url);
    this.ws = new WebSocket(url, {
      headers: {
        'Origin': 'https://web.whatsapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    });

    this.ws.onopen = () => console.log('WebSocket opened');
    this.ws.onmessage = (event) => console.log('WebSocket message:', event.data);
    this.ws.onclose = (event) => console.log('WebSocket closed:', event.code, event.reason);
    this.ws.onerror = (err) => console.error('WebSocket error:', err);
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.ws.close();
  }
}