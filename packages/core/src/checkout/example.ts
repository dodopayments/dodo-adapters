import { createSubscriptionCharge } from './checkout';

// Example usage of the createSubscriptionCharge function
async function example() {
  try {
    const charge = await createSubscriptionCharge(
      'sub_123', 
      {
        product_price: 1000, // $10.00 in cents
        product_currency: 'USD',
        product_description: 'One-time add-on charge for extra features',
        metadata: {
          orderId: 'order_456',
          reason: 'upgrade_fee'
        }
      },
      {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
        environment: 'test_mode'
      }
    );
    
    console.log('Subscription charge created successfully:', charge.payment_id);
  } catch (error) {
    console.error('Failed to create subscription charge:', error);
  }
}

// Run the example
example();