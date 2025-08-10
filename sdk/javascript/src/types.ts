export interface Attachment {
  filename: string;
  content?: string; // base64 encoded content
  path?: string; // file path (for server-side files)
  contentType?: string;
}

export interface SendEmailRequest {
  fromName?: string;
  fromEmail: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}

export interface SendEmailResponse {
  message: string;
}

export interface FreesendError {
  error: string;
}

export interface FreesendConfig {
  apiKey: string;
  baseUrl?: string;
}

export class FreesendError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FreesendError';
  }
} 