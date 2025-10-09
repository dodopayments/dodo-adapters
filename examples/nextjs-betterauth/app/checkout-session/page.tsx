"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function CheckoutSessionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authClient.dodopayments.checkout.session({
        product_cart: [{ product_id: "pdt_nZuwz45WAs64n3l07zpQR", quantity: 1 }],
        // Note: customer fields are auto-filled from the session when available.
        // This example also demonstrates providing explicit customer data.
        customer: {
          email: "customer@example.com",
          name: "John Doe",
        },
        billing_address: {
          street: "123 Market St",
          city: "San Francisco",
          state: "CA",
          zipcode: "94103",
          country: "US",
        },
        // If omitted, users will be returned to the current origin.
        return_url:
          typeof window !== "undefined"
            ? window.location.origin + "/dashboard"
            : undefined,
      });

      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
        Checkout Session Test
      </h1>
      <p style={{ color: "#555", marginBottom: "1rem" }}>
        This page creates a Checkout Session using the new checkout.session endpoint.
      </p>
      {error && (
        <div style={{ color: "#b91c1c", marginBottom: "1rem" }}>{error}</div>
      )}
      <button
        onClick={createSession}
        disabled={loading}
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "#059669",
          color: "#fff",
          border: 0,
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Checkout Session"}
      </button>
    </div>
  );
}


