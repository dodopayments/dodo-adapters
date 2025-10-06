import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSubscriptionCharge, subscriptionChargeSchema } from './checkout';
import DodoPayments from 'dodopayments';

// Mock the DodoPayments client
vi.mock('dodopayments', () => {
  const mockSubscriptions = {
    charge: vi.fn(),
  };

  const mockDodoPayments = vi.fn(() => ({
    subscriptions: mockSubscriptions,
  }));

  return {
    default: mockDodoPayments,
  };
});

describe('createSubscriptionCharge', () => {
  const mockConfig = {
    bearerToken: 'test-token',
    environment: 'test_mode' as const,
  };

  const mockPayload = {
    product_price: 1000,
    product_currency: 'USD',
    product_description: 'Test charge',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a subscription charge successfully', async () => {
    const mockResponse = { payment_id: 'pay_123' };
    (DodoPayments as any).mockImplementation(() => ({
      subscriptions: {
        charge: vi.fn().mockResolvedValue(mockResponse),
      },
    }));

    const result = await createSubscriptionCharge('sub_123', mockPayload, mockConfig);

    expect(result).toEqual({ payment_id: 'pay_123' });
    expect(DodoPayments).toHaveBeenCalledWith({
      bearerToken: 'test-token',
      environment: 'test_mode',
    });
  });

  it('should throw an error for invalid payload', async () => {
    const invalidPayload = {
      product_price: -100, // Invalid negative price
    };

    await expect(createSubscriptionCharge('sub_123', invalidPayload, mockConfig))
      .rejects
      .toThrow('Invalid subscription charge payload');
  });

  it('should throw an error for invalid subscription ID', async () => {
    await expect(createSubscriptionCharge('', mockPayload, mockConfig))
      .rejects
      .toThrow('Invalid subscription ID');
  });

  it('should handle API errors gracefully', async () => {
    (DodoPayments as any).mockImplementation(() => ({
      subscriptions: {
        charge: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    }));

    await expect(createSubscriptionCharge('sub_123', mockPayload, mockConfig))
      .rejects
      .toThrow('Failed to create subscription charge: API Error');
  });

  it('should handle missing payment_id in response', async () => {
    (DodoPayments as any).mockImplementation(() => ({
      subscriptions: {
        charge: vi.fn().mockResolvedValue({}), // Missing payment_id
      },
    }));

    await expect(createSubscriptionCharge('sub_123', mockPayload, mockConfig))
      .rejects
      .toThrow('Invalid response from Dodo Payments API: missing payment_id');
  });
});

describe('subscriptionChargeSchema', () => {
  it('should validate correct payload', () => {
    const validPayload = {
      product_price: 1000,
      product_currency: 'USD',
      product_description: 'Test charge',
      metadata: {
        key: 'value',
      },
    };

    const result = subscriptionChargeSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject negative product_price', () => {
    const invalidPayload = {
      product_price: -100,
    };

    const result = subscriptionChargeSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject non-integer product_price', () => {
    const invalidPayload = {
      product_price: 100.5,
    };

    const result = subscriptionChargeSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject invalid currency code', () => {
    const invalidPayload = {
      product_price: 1000,
      product_currency: 'US', // Too short
    };

    const result = subscriptionChargeSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should accept null currency', () => {
    const validPayload = {
      product_price: 1000,
      product_currency: null,
    };

    const result = subscriptionChargeSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });
});