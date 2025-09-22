import { describe, it, expect, vi } from 'vitest';
import { createMockSubscriptionWebhookEvent, createMockWebhookRequest } from '@dodopayments/testing';
import { Webhooks } from '../webhooks';

describe('Express Webhook Handler', () => {
  it('should handle a subscription webhook event', async () => {
    // Create a mock subscription webhook event
    const mockEvent = createMockSubscriptionWebhookEvent({
      type: 'subscription.active'
    });
    
    // Create a mock webhook request with proper signatures
    const { headers, body } = createMockWebhookRequest(mockEvent, 'whsec_testsecret123');
    
    // Create a mock Express request object
    const req = {
      method: 'POST',
      get: (key: string) => headers[key] || null,
      body: JSON.parse(body)
    } as any;
    
    // Create a mock Express response object
    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;
    
    // Create the webhook handler
    const handler = Webhooks({
      webhookKey: 'whsec_testsecret123',
      onSubscriptionActive: vi.fn()
    });
    
    // Call the webhook handler
    await handler(req, res);
    
    // Verify the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(null);
  });
});