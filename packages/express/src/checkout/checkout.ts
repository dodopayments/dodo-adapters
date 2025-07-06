import { Request, Response } from "express";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler = async (req: Request, res: Response) => {
    const queryParams = req.query;

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

    res.redirect(url);
  };

  return getHandler;
};
