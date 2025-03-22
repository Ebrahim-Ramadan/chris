import WhatsAppClient from '../src/client';

const client = new WhatsAppClient();
console.log('Starting bot...');
client.initialize().catch((err) => console.error('Caught error:', err));

setTimeout(() => {
  console.log('Shutting down...');
  client.disconnect();
}, 5000);