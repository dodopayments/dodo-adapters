import type { Request, Response } from "express";
import {
  buildCheckoutUrl,
  dynamicCheckoutBodySchema,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

export function checkoutHandler(config: CheckoutHandlerConfig) {
  const getHandler = async (req: Request, res: Response) => {
    const queryParams = req.query;

    if (!queryParams.productId) {
      return res.status(400).send("Please provide productId query parameter");
    }

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return res.status(400).send("Please provide productId query parameter");
      }
      return res
        .status(400)
        .send(`Invalid query parameters.\n ${error.message}`);
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return res.status(400).send(error.message);
    }

    return res.json({ checkout_url: url });
  };
  const postHandler = async (req: Request, res: Response) => {
    if (config.type === "dynamic") {
      // Handle dynamic checkout
      const { success, data, error } = dynamicCheckoutBodySchema.safeParse(
        req.body,
      );

      if (!success) {
        return res.status(400).send(`Invalid request body.\n ${error.message}`);
      }

      let url = "";
      try {
        url = await buildCheckoutUrl({ body: data, ...config, type: "dynamic" });
      } catch (error: any) {
        return res.status(400).send(error.message);
      }
      return res.json({ checkout_url: url });
    } else {
      // Handle checkout session
      const { success, data, error } = checkoutSessionPayloadSchema.safeParse(req.body);

      if (!success) {
        return res.status(400).send(`Invalid checkout session payload.\n ${error.message}`);
      }

      let url = "";
      try {
        url = await buildCheckoutUrl({
          sessionPayload: data,
          ...config,
          type: "session"
        });
      } catch (error: any) {
        return res.status(400).send(error.message);
      }
      return res.json({ checkout_url: url });
    }
  };

  return (req: Request, res: Response) => {
    if (req.method === "POST") {
      return postHandler(req, res);
    }

    if (req.method === "GET") {
      return getHandler(req, res);
    }

    return res.status(405).send("Method Not Allowed");
  };
}
