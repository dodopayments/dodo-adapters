import { FastifyRequest, FastifyReply } from "fastify";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  // GET handler for static checkout
  const getHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const queryParams = request.query as Record<string, string>;

    if (!queryParams.productId) {
      return reply.status(400).send("Please provide productId query parameter");
    }

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return reply
          .status(400)
          .send("Please provide productId query parameter");
      }
      return reply
        .status(400)
        .send(`Invalid query parameters.\n ${error.message}`);
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return reply.status(400).send(error.message);
    }

    return reply.redirect(url);
  };

  // POST handler for dynamic checkout
  const postHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;

    const { success, data, error } = dynamicCheckoutBodySchema.safeParse(body);

    if (!success) {
      return reply.status(400).send(`Invalid request body.\n ${error.message}`);
    }

    let url = "";
    try {
      url = await buildCheckoutUrl({ body: data, ...config });
    } catch (error: any) {
      return reply.status(400).send(error.message);
    }

    return reply.redirect(url);
  };

  return {
    getHandler,
    postHandler,
  };
};
