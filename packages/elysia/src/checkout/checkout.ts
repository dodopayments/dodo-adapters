import { Elysia, t } from "elysia";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  return new Elysia()
    .get(
      "/",
      async ({ query, set }) => {
        if (!query.productId) {
          set.status = 400;
          return { error: "Please provide productId query parameter" };
        }

        const { success, data, error } =
          checkoutQuerySchema.safeParse(query);

        if (!success) {
          set.status = 400;
          if (
            error.errors.some((e: any) => e.path.toString() === "productId")
          ) {
            return { error: "Please provide productId query parameter" };
          }
          return { error: `Invalid query parameters: ${error.message}` };
        }

        try {
          const checkoutUrl = await buildCheckoutUrl({
            queryParams: data,
            ...config,
          });
          return { checkout_url: checkoutUrl };
        } catch (error: any) {
          set.status = 400;
          return { error: error.message };
        }
      },
      {
        query: t.Object({
          productId: t.String(),
          quantity: t.Optional(t.String()),
          fullName: t.Optional(t.String()),
          email: t.Optional(t.String()),
          phoneNumber: t.Optional(t.String()),
          city: t.Optional(t.String()),
          country: t.Optional(t.String()),
          state: t.Optional(t.String()),
          street: t.Optional(t.String()),
          zipcode: t.Optional(t.String()),
        }),
      }
    )
    .post("/", async ({ body, set }) => {
      if (config.type === "dynamic") {
        // Handle dynamic checkout
        const { success, data, error } =
          dynamicCheckoutBodySchema.safeParse(body);

        if (!success) {
          set.status = 400;
          return { error: `Invalid request body: ${error.message}` };
        }

        try {
          const checkoutUrl = await buildCheckoutUrl({
            body: data,
            ...config,
            type: "dynamic",
          });
          return { checkout_url: checkoutUrl };
        } catch (error: any) {
          set.status = 400;
          return { error: error.message };
        }
      } else {
        // Handle checkout session
        const { success, data, error } =
          checkoutSessionPayloadSchema.safeParse(body);

        if (!success) {
          set.status = 400;
          return {
            error: `Invalid checkout session payload: ${error.message}`,
          };
        }

        try {
          const checkoutUrl = await buildCheckoutUrl({
            sessionPayload: data,
            ...config,
            type: "session",
          });
          return { checkout_url: checkoutUrl };
        } catch (error: any) {
          set.status = 400;
          return { error: error.message };
        }
      }
    });
};
