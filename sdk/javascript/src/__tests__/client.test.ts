import { Freesend } from '../client';
import { SendEmailRequest } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('Freesend Client', () => {
  let freesend: Freesend;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    freesend = new Freesend({ apiKey: mockApiKey });
    (fetch as jest.Mock).mockClear();
  });

  describe('constructor', () => {
    it('should create client with default base URL', () => {
      const client = new Freesend({ apiKey: mockApiKey });
      expect(client).toBeInstanceOf(Freesend);
    });

    it('should create client with custom base URL', () => {
      const customUrl = 'https://custom-freesend.com';
      const client = new Freesend({ apiKey: mockApiKey, baseUrl: customUrl });
      expect(client).toBeInstanceOf(Freesend);
    });
  });

  describe('sendEmail', () => {
    const mockEmailData: SendEmailRequest = {
      fromEmail: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    };

    it('should send email successfully', async () => {
      const mockResponse = { message: 'Email sent successfully' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await freesend.sendEmail(mockEmailData);

      expect(fetch).toHaveBeenCalledWith(
        'https://freesend.metafog.io/api/send-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`,
          },
          body: JSON.stringify(mockEmailData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = { error: 'Invalid API key' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      await expect(freesend.sendEmail(mockEmailData)).rejects.toThrow('Invalid API key');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(freesend.sendEmail(mockEmailData)).rejects.toThrow('Network error: Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(freesend.sendEmail(mockEmailData)).rejects.toThrow('Invalid API key');
    });
  });

  describe('email data validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        fromEmail: 'test@example.com',
        // Missing required fields
      } as SendEmailRequest;

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing required field' }),
      });

      await expect(freesend.sendEmail(invalidData)).rejects.toThrow();
    });
  });
}); 