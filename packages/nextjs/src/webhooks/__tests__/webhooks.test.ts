import { describe, it, expect, vi } from 'vitest';
import { createMockPaymentWebhookEvent, createMockWebhookRequest } from '@dodopayments/testing';
import { Webhooks } from '../webhooks';

// Mock the Next.js request object
const createMockNextRequest = (body: string, webhookHeaders: Record<string, string>) => {
  return {
    method: 'POST',
    text: vi.fn().mockResolvedValue(body),
    headers: {
      get: (key: string) => webhookHeaders[key] || null
    }
  } as any;
};

describe('Next.js Webhook Handler', () => {
  it('should handle a payment webhook event', async () => {
    // Create a mock payment webhook event
    const mockEvent = createMockPaymentWebhookEvent({
      type: 'payment.succeeded'
    });
    
    // Create a mock webhook request with proper signatures
    const { headers, body } = createMockWebhookRequest(mockEvent, 'whsec_testsecret123');
    
    // Create a mock Next.js request object
    const req = createMockNextRequest(body, headers);
    
    // Create the webhook handler
    const handler = Webhooks({
      webhookKey: 'whsec_testsecret123',
      onPayment: vi.fn()
    });
    
    // Call the webhook handler
    const response = await handler(req);
    
    // Verify the response
    expect(response.status).toBe(200);
  });
});