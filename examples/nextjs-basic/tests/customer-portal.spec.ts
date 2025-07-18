import { test, expect } from "@playwright/test";

const CUSTOMER_ID = "cus_un0pFPudSXuuXGnPdstw1";

test.describe("Customer Portal Endpoint", () => {
  test("should redirect to Dodo Payments customer portal with customer_id", async ({
    page,
  }) => {
    await page.goto(`/customer-portal?customer_id=${CUSTOMER_ID}`);

    // Should redirect to Dodo Payments customer portal
    await expect(page).toHaveURL(/test\.customer\.dodopayments\.com/);
  });

  test("should redirect to Dodo Payments customer portal with customer_id and send_email", async ({
    page,
  }) => {
    await page.goto(
      `/customer-portal?customer_id=${CUSTOMER_ID}&send_email=true`,
    );

    // Should redirect to Dodo Payments customer portal
    await expect(page).toHaveURL(/test\.customer\.dodopayments\.com/);
  });

  test("should redirect to customer portal with additional parameters", async ({
    page,
  }) => {
    await page.goto(
      `/customer-portal?customer_id=${CUSTOMER_ID}&return_url=http://localhost:3000/success`,
    );

    // Should redirect to Dodo Payments customer portal
    await expect(page).toHaveURL(/test\.customer\.dodopayments\.com/);
  });

  test("should not accept POST requests to customer portal endpoint", async ({
    page,
  }) => {
    const response = await page.request.post("/customer-portal", {
      data: {
        customer_id: CUSTOMER_ID,
      },
    });

    // Should return method not allowed (405) or similar error
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
