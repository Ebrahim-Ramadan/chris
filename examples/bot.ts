import WhatsAppClient from '../src/client';

const client = new WhatsAppClient();

client.addEventListener('qr', (event: CustomEvent) => {
  console.log('QR Code:', event.detail.code);
  console.log('Scan this with your WhatsApp app.');
});

client.addEventListener('ready', () => {
  console.log('WhatsApp client ready!');
  client.sendMessage('1234567890@s.whatsapp.net', 'Hello from my Bun WhatsApp API!');
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