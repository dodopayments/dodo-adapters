import { redirect, error, type RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import DodoPayments, { ClientOptions } from 'dodopayments';

export type CustomerPortalConfig = Pick<ClientOptions, 'environment' | 'bearerToken'>;

export const CustomerPortal = ({ bearerToken, environment }: CustomerPortalConfig) => {
  const getHandler: RequestHandler = async (event: RequestEvent) => {
    const searchParams = event.url.searchParams;
    const customerId = searchParams.get('customer_id');
    const params: { send_email?: boolean } = { send_email: false };
    const sendEmail = searchParams.get('send_email');
    if (sendEmail === 'true') {
      params.send_email = true;
    }
    if (!customerId) {
      throw error(400, 'Missing customerId in query parameters');
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerId,
        params
      );
      return new Response(null, {
        status: 302,
        headers: { Location: session.link },
      });
    } catch (err: any) {
      console.error('Error creating customer portal session:', err);
      throw error(500, `Failed to create customer portal session: ${err.message}`);
    }
  };

  // SvelteKit expects named exports for HTTP verbs
  return {
    GET: getHandler,
  };
};
