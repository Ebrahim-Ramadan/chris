export interface WhatsAppOptions {
  session?: string; // For restoring sessions
}

export interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: number;
}

export interface QRCode {
  code: string;
}