import WhatsAppClient from '../src/client';

const client = new WhatsAppClient({ headless: true });

client.addEventListener('qr', (event: CustomEvent) => {
  console.log('QR Code generated. Scan it to log in:', event.detail);
});

client.addEventListener('ready', () => {
  console.log('WhatsApp client ready!');
  client.sendMessage('Friend Name', 'Hello from my Bun-powered WhatsApp lib!');
});

client.addEventListener('message', (event: CustomEvent) => {
  const msg = event.detail;
  console.log(`New message from ${msg.from}: ${msg.text}`);
  if (msg.text.toLowerCase() === 'ping') {
    client.sendMessage(msg.from, 'Pong!');
  }
});

client.addEventListener('error', (event: CustomEvent) => {
  console.error('Error:', (event.detail as Error).message);
});

client.initialize().catch((err) => console.error(err));