import { test, expect } from "@playwright/test";

test.describe("Checkout Endpoints", () => {
  const PRODUCT_ID = "pdt_nZuwz45WAs64n3l07zpQR";

  test("should redirect to Dodo Payments checkout with productId", async ({
    page,
  }) => {
    await page.goto(`/checkout?productId=${PRODUCT_ID}`);

    // Should redirect to Dodo Payments checkout
    await expect(page).toHaveURL(/test\.checkout\.dodopayments\.com/);

    // Should contain the product ID in the URL
    expect(page.url()).toContain(PRODUCT_ID);

    // Should display the checkout page
    await expect(page.getByRole("heading", { name: "Acme" })).toBeVisible();
  });

  test("should redirect to Dodo Payments checkout with multiple parameters", async ({
    page,
  }) => {
    await page.goto(
      `/checkout?productId=${PRODUCT_ID}&quantity=2&customer_email=test@example.com`,
    );

    // Should redirect to Dodo Payments checkout
    await expect(page).toHaveURL(/test\.checkout\.dodopayments\.com/);

    // Should contain the product ID in the URL
    expect(page.url()).toContain(PRODUCT_ID);

    // Should display the checkout page
    await expect(page.getByRole("heading", { name: "Acme" })).toBeVisible();
  });

  test("should handle POST request to checkout endpoint", async ({ page }) => {
    const response = await page.request.post("/checkout", {
      data: {
        product_id: PRODUCT_ID,
        quantity: 1,
        billing: {
          city: "Test City",
          country: "US",
          state: "CA",
          street: "123 Test St",
          zipcode: "12345",
        },
        customer: {
          email: "test@example.com",
          name: "Test User",
        },
        payment_link: true,
      },
    });

    // Should return the checkout page (after redirect)
    expect(response.status()).toBe(200);

    // Should be on the Dodo Payments checkout domain
    expect(response.url()).toContain("test.checkout.dodopayments.com");
  });

  test("should handle POST request to checkout endpoint with complex data", async ({
    page,
  }) => {
    const response = await page.request.post("/checkout", {
      data: {
        product_id: PRODUCT_ID,
        quantity: 2,
        billing: {
          city: "Test City",
          country: "US",
          state: "CA",
          street: "123 Test St",
          zipcode: "12345",
        },
        customer: {
          email: "test@example.com",
          name: "Test User",
        },
        metadata: {
          source: "test",
          campaign: "e2e-testing",
        },
        payment_link: true,
      },
    });

    // Should return the checkout page (after redirect)
    expect(response.status()).toBe(200);

    // Should be on the Dodo Payments checkout domain
    expect(response.url()).toContain("test.checkout.dodopayments.com");
  });
});
