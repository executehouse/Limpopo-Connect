import { Order, updateOrderStatus } from '../models/order';

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  client_secret?: string;
  metadata: {
    orderId: string;
  };
}

// A stubbed payment provider service
class PaymentService {
  private provider: 'stripe' | 'payfast' | 'stub';

  constructor(provider: 'stripe' | 'payfast' | 'stub' = 'stub') {
    this.provider = provider;
  }

  async createPaymentIntent(order: Order): Promise<PaymentIntent> {
    console.log(`Creating payment intent for order ${order.id} with provider ${this.provider}`);

    // In a real scenario, you would call the provider's API here.
    // For the stub, we'll just simulate a successful intent.
    const intent: PaymentIntent = {
      id: `pi_${order.id}`,
      amount: order.total * 100, // Amount in cents
      currency: 'zar',
      status: 'pending',
      client_secret: `pi_${order.id}_secret_stub`, // A dummy secret
      metadata: {
        orderId: order.id,
      },
    };
    return intent;
  }

  async handlePaymentWebhook(payload: any): Promise<boolean> {
    // In a real scenario, you would verify the webhook signature here.
    const eventType = payload.type;
    const paymentIntent = payload.data.object as PaymentIntent;

    if (eventType === 'payment_intent.succeeded') {
      const orderId = paymentIntent.metadata.orderId;
      console.log(`Payment succeeded for order ${orderId}. Updating order status.`);
      await updateOrderStatus(orderId, 'paid');
      return true;
    }

    console.log(`Unhandled webhook event type: ${eventType}`);
    return false;
  }

  // This is a direct simulation for the stub/testing flow.
  async simulateSuccessfulPayment(orderId: string): Promise<boolean> {
    console.log(`Simulating successful payment for order ${orderId}.`);
    const updatedOrder = await updateOrderStatus(orderId, 'paid');
    return !!updatedOrder;
  }
}

export const paymentService = new PaymentService(process.env.PAYMENT_PROVIDER as any || 'stub');