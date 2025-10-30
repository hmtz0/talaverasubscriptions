/**
 * Stripe Payment Adapter Interface
 * This is a mock implementation that simulates Stripe behavior
 */

export interface PaymentIntent {
  id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
  currency: string;
}

export interface StripeAdapter {
  createSubscription(userId: number, planId: number): Promise<PaymentIntent>;
}

/**
 * Mock Stripe Adapter
 * Simulates Stripe API calls without actual payment processing
 */
export class MockStripeAdapter implements StripeAdapter {
  async createSubscription(userId: number, planId: number): Promise<PaymentIntent> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate fake payment intent ID (similar to Stripe format)
    const paymentIntentId = `pi_mock_${Date.now()}_${userId}_${planId}`;

    // Mock successful payment
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: planId === 2 ? 999 : 0, // Pro plan costs $9.99, Free is $0
      currency: 'usd',
    };
  }
}

// Export singleton instance
export const stripeAdapter: StripeAdapter = new MockStripeAdapter();
