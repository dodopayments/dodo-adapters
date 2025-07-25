export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Better Auth with Dodo Payments</h1>

      <p>
        This is a Next.js example showing how to use Better Auth for
        authentication alongside the Dodo Payments adapter.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Authentication</h2>
        <p>
          Sign in or sign up to access protected features. This example
          includes:
        </p>
        <ul>
          <li>Email/password authentication</li>
          <li>GitHub OAuth integration</li>
          <li>Protected dashboard page</li>
          <li>User session management</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Available Endpoints</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>🔐 Authentication</h3>
          <p>
            <strong>Auth API:</strong> <code>/api/auth/*</code>
          </p>
          <p>
            Better Auth handles all authentication endpoints including sign in,
            sign up, and OAuth callbacks.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>🛒 Checkout (Dodo Payments)</h3>
          <p>
            <strong>Dynamic Checkout (POST):</strong>{" "}
            <code>/api/auth/checkout</code>
          </p>
          <p>
            <strong>Static Checkout (GET):</strong>{" "}
            <code>/api/auth/checkout/static</code>
          </p>
          <p>
            These endpoints redirect authenticated users to the Dodo Payments
            checkout page. Use the product slug "example-product" or productId.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>👤 Customer Portal (Dodo Payments)</h3>
          <p>
            <strong>URL:</strong> <code>/api/auth/customer/portal</code>
          </p>
          <p>
            The customer portal endpoint redirects authenticated users to their
            Dodo Payments customer portal.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>📊 Customer Data</h3>
          <p>
            <strong>Subscriptions:</strong>{" "}
            <code>/api/auth/customer/subscriptions/list</code>
          </p>
          <p>
            <strong>Payments:</strong>{" "}
            <code>/api/auth/customer/payments/list</code>
          </p>
          <p>
            These endpoints return the customer's subscription and payment
            history.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>🔗 Webhook</h3>
          <p>
            <strong>URL:</strong> <code>/api/auth/webhooks/dodopayments</code>
          </p>
          <p>
            This endpoint processes incoming webhook events from Dodo Payments.
            Configure this URL in your Dodo Payments dashboard.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Environment Variables</h2>
        <p>Make sure to set up the following environment variables:</p>
        <ul>
          <li>
            <code>BETTER_AUTH_URL</code> - Base URL of your app (e.g.,
            http://localhost:3000)
          </li>
          <li>
            <code>DODO_PAYMENTS_API_KEY</code> - Your Dodo Payments API key
          </li>
          <li>
            <code>RETURN_URL</code> - URL to redirect after successful checkout
            (defaults to /dashboard)
          </li>
          <li>
            <code>DODO_PAYMENTS_WEBHOOK_SECRET</code> - Your webhook secret for
            signature verification
          </li>
          <li>
            <code>NODE_ENV</code> - Set to "production" for live mode, otherwise
            test mode is used
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Client-side Usage</h2>
        <p>
          The Dodo Payments adapter provides client-side functions for easy
          integration:
        </p>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          <pre style={{ margin: 0, overflow: "auto" }}>
            {`// Example: Creating a checkout
const checkout = await authClient.dodopayments.checkout.mutate({
  slug: "example-product",
});

if (checkout.redirect) {
  window.location.href = checkout.url;
}

// Example: Accessing customer portal
const portal = await authClient.dodopayments.portal.query();
if (portal.redirect) {
  window.location.href = portal.url;
}`}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Get Started</h2>
        <p>
          <a
            href="/auth"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            Go to Authentication
          </a>
        </p>
      </div>
    </main>
  );
}
