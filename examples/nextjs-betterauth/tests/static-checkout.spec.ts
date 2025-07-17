import { test, expect } from '@playwright/test';

// Helper function to authenticate user
async function authenticateUser(page) {
  await page.goto('/auth');
  
  // Fill in sign in form with provided credentials
  await page.getByRole('textbox', { name: 'Email:' }).fill('johnwich@example.com');
  await page.getByRole('textbox', { name: 'Password:' }).fill('password');
  
  // Click sign in (use exact match to avoid confusion with GitHub button)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/);
}

test.describe('Static Checkout', () => {
  test.describe('Unauthenticated Users', () => {
    test('should require authentication for checkout', async ({ page }) => {
      // Test the static checkout endpoint without authentication
      const response = await page.goto('/api/auth/checkout/static?productId=pdt_qgfkjO07Cd6y0sscIFoQd');
      
      // Should return 401 unauthorized since authenticatedUsersOnly is true
      expect(response?.status()).toBe(401);
    });

    test('should handle missing productId parameter', async ({ page }) => {
      // Test the static checkout endpoint without productId
      const response = await page.goto('/api/auth/checkout/static');
      
      // Should return an error response with 401 status (authentication required)
      expect(response?.status()).toBe(401);
    });

    test('should handle invalid productId parameter', async ({ page }) => {
      // Test the static checkout endpoint with invalid productId
      const response = await page.goto('/api/auth/checkout/static?productId=invalid-product-id');
      
      // Should return an error response with 401 status (authentication required)
      expect(response?.status()).toBe(401);
    });

    test('should handle invalid product slug parameter', async ({ page }) => {
      // Test the static checkout endpoint with invalid slug
      const response = await page.goto('/api/auth/checkout/static?slug=invalid-slug');
      
      // Should return an error response with 401 status (authentication required)
      expect(response?.status()).toBe(401);
    });
  });

  test.describe('Authenticated Users', () => {
    test('should redirect to Dodo Payments checkout with valid productId', async ({ page }) => {
      // First, authenticate the user
      await authenticateUser(page);
      
      // Navigate to the static checkout endpoint with valid productId
      await page.goto('/api/auth/checkout/static?productId=pdt_qgfkjO07Cd6y0sscIFoQd');
      
      // Check that we were redirected to the correct domain and product
      expect(page.url()).toContain('test.checkout.dodopayments.com');
      expect(page.url()).toContain('pdt_qgfkjO07Cd6y0sscIFoQd');
      
      // Verify the page title indicates we're on the checkout page
      expect(await page.title()).toContain('Checkout');
    });

    test('should redirect to Dodo Payments checkout with valid slug', async ({ page }) => {
      // First, authenticate the user
      await authenticateUser(page);
      
      // Navigate to the static checkout endpoint with valid slug
      await page.goto('/api/auth/checkout/static?slug=the-alchemist');
      
      // Check that we were redirected to the correct domain
      expect(page.url()).toContain('test.checkout.dodopayments.com');
      // The slug should resolve to the configured product ID
      expect(page.url()).toContain('pdt_nZuwz45WAs64n3l07zpQR');
      
      // Verify the page title indicates we're on the checkout page
      expect(await page.title()).toContain('Checkout');
    });

    test('should handle missing productId parameter for authenticated users', async ({ page }) => {
      // First, authenticate the user
      await authenticateUser(page);
      
      // Test the static checkout endpoint without productId
      const response = await page.goto('/api/auth/checkout/static');
      
      // Should return an error response with 400 status
      expect(response?.status()).toBe(400);
      
      // Check for the specific error message
      const content = await page.textContent('body');
      expect(content).toContain('PRODUCTID_OR_SLUG_NOT_PROVIDED');
    });

    test('should handle invalid productId parameter for authenticated users', async ({ page }) => {
      // First, authenticate the user
      await authenticateUser(page);
      
      // Test the static checkout endpoint with invalid productId
      const response = await page.goto('/api/auth/checkout/static?productId=invalid-product-id');
      
      // Should return an error response with 500 status
      expect(response?.status()).toBe(500);
      
      // Check for the specific error message
      const content = await page.textContent('body');
      expect(content).toContain('CHECKOUT_REDIRECT_HANDLING_FAILED');
    });

    test('should handle invalid product slug parameter for authenticated users', async ({ page }) => {
      // First, authenticate the user
      await authenticateUser(page);
      
      // Test the static checkout endpoint with invalid slug
      const response = await page.goto('/api/auth/checkout/static?slug=invalid-slug');
      
      // Should return an error response with 400 status
      expect(response?.status()).toBe(400);
      
      // Check for the specific error message
      const content = await page.textContent('body');
      expect(content).toContain('PRODUCT_NOT_FOUND');
    });
  });
});