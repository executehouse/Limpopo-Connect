import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findOrderById } from '../models/order';
import { paymentService } from '../services/payment';

const ordersPay = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const orderId = request.params.id;
    const userId = request.authedUser!.id;

    if (!orderId) {
        return { status: 400, jsonBody: { error: 'Order ID is required.' } };
    }

    try {
        const order = await findOrderById(orderId);
        if (!order) {
            return { status: 404, jsonBody: { error: 'Order not found.' } };
        }

        if (order.buyer_id !== userId) {
            return { status: 403, jsonBody: { error: 'Forbidden: You cannot pay for an order that is not yours.' } };
        }

        if (order.status !== 'pending') {
            return { status: 409, jsonBody: { error: `Order is already ${order.status}.` } };
        }

        // In a real implementation, this would redirect to a payment page or use a client-side SDK.
        // For this stub, we'll directly simulate a successful payment.
        const paymentSuccess = await paymentService.simulateSuccessfulPayment(orderId);

        if (!paymentSuccess) {
            return { status: 500, jsonBody: { error: 'Payment processing failed.' } };
        }

        return {
            status: 200,
            jsonBody: { message: 'Payment successful', orderStatus: 'paid' }
        };
    } catch (error) {
        context.log('Error processing payment:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('ordersPay', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'orders/{id}/pay',
    handler: withAuth(ordersPay, ['admin', 'business', 'resident'])
});