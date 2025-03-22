import WhatsAppClient from '../src/client';

const client = new WhatsAppClient();

client.addEventListener('ready', () => {
  console.log('WhatsApp client ready!');
});

client.addEventListener('error', (event: CustomEvent) => {
  console.error('Error event:', (event.detail as Error).message);
});

console.log('Starting bot...');
client.initialize().catch((err) => console.error('Caught error:', err));