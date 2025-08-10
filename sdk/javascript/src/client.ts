import { SendEmailRequest, SendEmailResponse, FreesendConfig, FreesendError } from './types';

export class Freesend {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: FreesendConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://freesend.metafog.io';
  }

  async sendEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
    // Validate required fields
    if (!data.fromEmail) {
      throw new FreesendError('fromEmail is required');
    }
    if (!data.to) {
      throw new FreesendError('to is required');
    }
    if (!data.subject) {
      throw new FreesendError('subject is required');
    }
    if (!data.text && !data.html) {
      throw new FreesendError('Either text or html content is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      let responseData: any;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, treat it as an API error
        throw new FreesendError('Invalid API key', response.status);
      }

      if (!response.ok) {
        throw new FreesendError(
          responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return responseData as SendEmailResponse;
    } catch (error) {
      if (error instanceof FreesendError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new FreesendError(`Network error: ${error.message}`);
      }
      
      throw new FreesendError('Unknown error occurred');
    }
  }
} 