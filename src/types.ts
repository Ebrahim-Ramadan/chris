export interface WhatsAppOptions {
  headless?: boolean;
  userDataDir?: string;
}

export interface Message {
  from: string;
  text: string;
  timestamp: number;
}