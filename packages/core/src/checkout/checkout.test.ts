import { describe, it, expect, vi, beforeEach } from "vitest";
import DodoPayments from "dodopayments";
import { buildCheckoutUrl } from "./checkout";
import type { z } from "zod";
import type { checkoutQuerySchema } from "./checkout";

vi.mock("dodopayments");

const mockRetrieve = vi.fn();
vi.mocked(DodoPayments).mockImplementation(() => {
  return {
    products: {
      retrieve: mockRetrieve,
    },
  } as any;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockRetrieve.mockResolvedValue({ id: "prod_123" });
});

describe("buildCheckoutUrl", () => {
  const baseConfig = {
    bearerToken: "sk_test_123",
    environment: "test_mode" as const,
  };

  it("should build a checkout URL with minimal parameters", async () => {
    const queryParams = { productId: "prod_123" };
    const url = await buildCheckoutUrl({ ...baseConfig, queryParams });

    expect(mockRetrieve).toHaveBeenCalledWith("prod_123");
    expect(url).toBe(
      "https://test.checkout.dodopayments.com/buy/prod_123?quantity=1",
    );
  });

  it("should use the production URL when environment is not test_mode", async () => {
    const queryParams = { productId: "prod_123" };
    const url = await buildCheckoutUrl({
      ...baseConfig,
      environment: "live_mode",
      queryParams,
    });

    expect(url).toContain("https://checkout.dodopayments.com");
  });

  it("should throw an error for invalid query parameters", async () => {
    const queryParams = {}; // Missing productId
    await expect(
      buildCheckoutUrl({
        ...baseConfig,
        queryParams: queryParams as any,
      }),
    ).rejects.toThrow("Invalid query parameters");
  });

  it("should throw an error if the product is not found", async () => {
    mockRetrieve.mockRejectedValue(new Error("Not Found"));
    const queryParams = { productId: "prod_invalid" };

    try {
      await expect(
        buildCheckoutUrl({ ...baseConfig, queryParams }),
      ).rejects.toThrow("Product not found");
    } catch (e) {}
  });

  it("should include all customer and billing fields in the URL", async () => {
    const queryParams: z.infer<typeof checkoutQuerySchema> = {
      productId: "prod_123",
      quantity: "2",
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      country: "US",
      addressLine: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
    };

    const url = await buildCheckoutUrl({ ...baseConfig, queryParams });

    const generatedUrl = new URL(url);
    for (const [key, value] of Object.entries(queryParams)) {
      if (key !== "productId") {
        expect(generatedUrl.searchParams.get(key)).toBe(value);
      }
    }
  });

  it("should include disable flags when set to 'true'", async () => {
    const queryParams = {
      productId: "prod_123",
      disableEmail: "true",
      disableCountry: "false", // should not be included
    };
    const url = await buildCheckoutUrl({ ...baseConfig, queryParams });

    expect(url).toContain("disableEmail=true");
    expect(url).not.toContain("disableCountry");
  });

  it("should include advanced controls in the URL and use USD", async () => {
    const queryParams = {
      productId: "prod_123",
      paymentCurrency: "USD",
      showCurrencySelector: "true",
      paymentAmount: "9999", // in cents
      showDiscounts: "false",
    };
    const url = await buildCheckoutUrl({ ...baseConfig, queryParams });

    expect(url).toContain("paymentCurrency=USD");
    expect(url).toContain("showCurrencySelector=true");
    expect(url).toContain("paymentAmount=9999");
    expect(url).toContain("showDiscounts=false");
  });

  it("should include metadata fields in the URL", async () => {
    const queryParams = {
      productId: "prod_123",
      metadata_orderId: "order_abc",
      metadata_userId: "user_123",
    };

    const url = await buildCheckoutUrl({
      ...baseConfig,
      queryParams: queryParams as any,
    });

    expect(url).toContain("metadata_orderId=order_abc");
    expect(url).toContain("metadata_userId=user_123");
  });

  it("should include the successUrl as redirect_url", async () => {
    const queryParams = { productId: "prod_123" };
    const successUrl = "https://example.com/success";
    const url = await buildCheckoutUrl({
      ...baseConfig,
      queryParams,
      successUrl,
    });

    expect(url).toContain(`redirect_url=${encodeURIComponent(successUrl)}`);
  });

  it("should not include unknown parameters in the URL", async () => {
    const queryParams = {
      productId: "prod_123",
      foo: "bar",
      metadata_test: "true",
    };

    const url = await buildCheckoutUrl({
      ...baseConfig,
      queryParams: queryParams as any,
    });

    expect(url).not.toContain("foo=bar");
    expect(url).toContain("metadata_test=true");
  });

  it("should include all possible valid query parameters in the URL", async () => {
    const queryParams = {
      productId: "prod_123",
      quantity: "5",
      fullName: "Jane Doe",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      country: "GB",
      addressLine: "456 Park Ave",
      city: "London",
      state: "N/A",
      zipCode: "SW1A 0AA",
      disableFullName: "true",
      disableFirstName: "false",
      disableEmail: "true",
      paymentCurrency: "GBP",
      showCurrencySelector: "true",
      paymentAmount: "12345",
      showDiscounts: "false",
      metadata_orderRef: "ref_456",
    };
    const successUrl = "https://example.com/thank-you";

    const url = await buildCheckoutUrl({
      ...baseConfig,
      queryParams: queryParams as any,
      successUrl,
    });

    const generatedUrl = new URL(url);
    const params = generatedUrl.searchParams;

    // Check standard params
    expect(params.get("quantity")).toBe("5");
    expect(params.get("fullName")).toBe("Jane Doe");
    expect(params.get("firstName")).toBe("Jane");
    expect(params.get("lastName")).toBe("Doe");
    expect(params.get("email")).toBe("jane.doe@example.com");
    expect(params.get("country")).toBe("GB");
    expect(params.get("addressLine")).toBe("456 Park Ave");
    expect(params.get("city")).toBe("London");
    expect(params.get("state")).toBe("N/A");
    expect(params.get("zipCode")).toBe("SW1A 0AA");

    // Check disable flags
    expect(params.get("disableFullName")).toBe("true");
    expect(params.has("disableFirstName")).toBe(false);
    expect(params.get("disableEmail")).toBe("true");

    // Check advanced controls
    expect(params.get("paymentCurrency")).toBe("GBP");
    expect(params.get("showCurrencySelector")).toBe("true");
    expect(params.get("paymentAmount")).toBe("12345");
    expect(params.get("showDiscounts")).toBe("false");

    // Check metadata
    expect(params.get("metadata_orderRef")).toBe("ref_456");

    // Check successUrl
    expect(params.get("redirect_url")).toBe(successUrl);
  });
});
