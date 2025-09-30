"use client";
export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Dodo Payments NextJS Adapter Example</h1>

      <p>
        This is a minimal example showing how to use the{" "}
        <code>@dodopayments/nextjs</code> adapter in a Next.js application.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Available Endpoints</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>🛒 Checkout</h3>
          <p>
            <strong>Static Checkout (GET):</strong>{" "}
            <code>/checkout?productId=YOUR_PRODUCT_ID</code>
          </p>
          <p>
            <strong>Dynamic Checkout (POST):</strong> <code>/checkout</code>
          </p>
          <p>
            The checkout endpoint redirects users to the Dodo Payments checkout
            page.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>👤 Customer Portal</h3>
          <p>
            <strong>URL:</strong>{" "}
            <code>/customer-portal?customer_id=YOUR_CUSTOMER_ID</code>
          </p>
          <p>
            The customer portal endpoint redirects authenticated users to their
            Dodo Payments customer portal.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>🔗 Webhook</h3>
          <p>
            <strong>URL:</strong> <code>/api/webhook/dodo-payments</code>
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
            <code>DODO_PAYMENTS_API_KEY</code> - Your Dodo Payments API key
          </li>
          <li>
            <code>DODO_ENVIRONMENT</code> - <code>test_mode</code> or <code>live_mode</code>
          </li>
          <li>
            <code>RETURN_URL</code> - URL to redirect after successful checkout
          </li>
          <li>
            <code>DODO_PAYMENTS_WEBHOOK_SECRET</code> - Your webhook secret for
            signature verification
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Example Usage</h2>
        <p>
          Try these sample links (replace with your actual product and customer
          IDs):
        </p>
        <ul>
          <li>
            <a href="/checkout?productId=pdt_example123">
              Static Checkout Example
            </a>
          </li>
          <li>
            <a href="/customer-portal?customer_id=cus_example123">
              Customer Portal Example
            </a>
          </li>
          <li>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/change-plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subscription_id: "sub_example123",
                      product_id: "pdt_newplan123",
                      proration_billing_mode: "prorated_immediately",
                      quantity: 1,
                    }),
                  });

                  if (!res.ok) {
                    let message = `Request failed (${res.status})`;
                    try {
                      const maybeJson = await res.json();
                      if (maybeJson && maybeJson.error) {
                        message = maybeJson.error;
                      }
                    } catch (_) {
                      try {
                        const text = await res.text();
                        if (text) message = text;
                      } catch (_) {}
                    }
                    alert(`Error: ${message}`);
                    return;
                  }

                  let payload: any = null;
                  try {
                    payload = await res.json();
                  } catch (_) {
                    // empty body OK; treat as success
                  }
                  alert("Plan changed");
                } catch (err) {
                  console.error("Change plan request failed", err);
                  alert("Network error. Please try again.");
                }
              }}
            >
              Example: Change Plan (POST /api/change-plan)
            </button>
          </li>
        </ul>
      </div>
    </main>
  );
}
