"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

const usagePlans = [
  {
    id: "pdt_apn1sTGe7EDL7Fvr3DFc7",
    slug: "builder-usage",
    name: "Builder Usage Plan",
    price: "$29",
    billing: "per month + usage",
    description: "Kick off with 1K metered API requests included.",
    features: [
      "1,000 included API requests tracked via the API Requests meter",
      "$0.005 per request after the free tier",
      "Perfect for staging environments and hobby apps",
    ],
    isPopular: false,
  },
  {
    id: "pdt_d070G65RvTDecT0zmLMOU",
    slug: "scale-usage",
    name: "Scale Usage Plan",
    price: "$99",
    billing: "per month + usage",
    description: "Production-grade limits with sharp overage pricing.",
    features: [
      "10,000 included API requests",
      "$0.002 per request beyond the allowance",
      "Priority support + shared throttling insights",
    ],
    isPopular: true,
  },
];

const classicProducts = [
  {
    id: "pdt_qL2FIheq3vl2TdDRr5a2Q",
    name: "Simple Subscription",
    price: "$1.05",
    billing: "per month",
    description: "Perfect for individuals getting started",
    features: ["Basic features", "Email support", "5 projects"],
    isPopular: false,
  },
  {
    id: "pdt_qgfkjO07Cd6y0sscIFoQd",
    name: "Another Subscription",
    price: "₹99",
    billing: "per month",
    description: "Great for growing teams and businesses",
    features: [
      "Advanced features",
      "Priority support",
      "Unlimited projects",
      "Analytics",
    ],
    isPopular: true,
  },
  {
    id: "pdt_nZuwz45WAs64n3l07zpQR",
    name: "The Alchemist [E-Book]",
    price: "$5.43",
    billing: "one-time",
    description: "Digital book purchase - no subscription",
    features: ["Instant download", "PDF format", "Lifetime access"],
    isPopular: false,
  },
];

export default function CheckoutPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    try {
      setLoading(productId);
      setError(null);

      const result = await authClient.dodopayments.checkoutSession({
        product_cart: [{ product_id: productId, quantity: 1 }],
      });

      console.log(result);

      if (result.data && result.data.redirect && result.data.url) {
        window.location.href = result.data.url;
      } else {
        console.log(result.error);
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during checkout",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#1a1a1a",
          }}
        >
          Checkout
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Complete your billing information and select a plan to get started.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            color: "#c33",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Usage-based Plans */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          Usage-Based Plans
        </h2>
        <p style={{ color: "#4b5563", textAlign: "center" }}>
          These plans use the API Requests meter to bill beyond the included
          request allowance.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {usagePlans.map((product) => (
          <div
            key={product.id}
            style={{
              border: product.isPopular
                ? "2px solid #059669"
                : "1px solid #e5e5e5",
              borderRadius: "12px",
              padding: "2rem",
              backgroundColor: "#fff",
              position: "relative",
              boxShadow: product.isPopular
                ? "0 10px 25px rgba(5, 150, 105, 0.1)"
                : "0 4px 6px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = product.isPopular
                ? "0 20px 40px rgba(5, 150, 105, 0.15)"
                : "0 10px 20px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = product.isPopular
                ? "0 10px 25px rgba(5, 150, 105, 0.1)"
                : "0 4px 6px rgba(0, 0, 0, 0.05)";
            }}
          >
            {product.isPopular && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#059669",
                  color: "white",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Most Popular
              </div>
            )}

            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "#eef2ff",
                color: "#4338ca",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Usage&nbsp;Based
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1a1a1a",
                }}
              >
                {product.name}
              </h2>
              <div style={{ marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {product.price}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#666",
                    marginLeft: "0.5rem",
                  }}
                >
                  {product.billing}
                </span>
              </div>
              {product.slug && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    marginTop: "0.5rem",
                  }}
                >
                  Slug: <code>{product.slug}</code>
                </p>
              )}
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                {product.description}
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  <span
                    style={{
                      color: "#059669",
                      marginRight: "0.75rem",
                      fontSize: "1.2rem",
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(product.id)}
              disabled={loading === product.id}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: product.isPopular ? "#059669" : "#f8f9fa",
                color: product.isPopular ? "white" : "#059669",
                border: product.isPopular ? "none" : "2px solid #059669",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading === product.id ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading === product.id ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (loading !== product.id) {
                  e.currentTarget.style.backgroundColor = product.isPopular
                    ? "#047857"
                    : "#059669";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (loading !== product.id) {
                  e.currentTarget.style.backgroundColor = product.isPopular
                    ? "#059669"
                    : "#f8f9fa";
                  e.currentTarget.style.color = product.isPopular
                    ? "white"
                    : "#059669";
                }
              }}
            >
              {loading === product.id
                ? "Processing..."
                : `Choose ${product.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Standard subscriptions / one-time products */}
      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          Classic Plans & Products
        </h2>
        <p style={{ color: "#4b5563", textAlign: "center" }}>
          Still need a simple subscription or a one-time purchase? Pick from the
          legacy catalog below.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {classicProducts.map((product) => (
          <div
            key={product.id}
            style={{
              border: product.isPopular
                ? "2px solid #2563eb"
                : "1px solid #e5e5e5",
              borderRadius: "12px",
              padding: "2rem",
              backgroundColor: "#fff",
              position: "relative",
              boxShadow: product.isPopular
                ? "0 10px 25px rgba(37, 99, 235, 0.15)"
                : "0 4px 6px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = product.isPopular
                ? "0 20px 40px rgba(37, 99, 235, 0.2)"
                : "0 10px 20px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = product.isPopular
                ? "0 10px 25px rgba(37, 99, 235, 0.15)"
                : "0 4px 6px rgba(0, 0, 0, 0.05)";
            }}
          >
            {product.isPopular && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Fan Favorite
              </div>
            )}

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1a1a1a",
                }}
              >
                {product.name}
              </h2>
              <div style={{ marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: "#2563eb",
                  }}
                >
                  {product.price}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#666",
                    marginLeft: "0.5rem",
                  }}
                >
                  {product.billing}
                </span>
              </div>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                {product.description}
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  <span
                    style={{
                      color: "#2563eb",
                      marginRight: "0.75rem",
                      fontSize: "1.2rem",
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(product.id)}
              disabled={loading === product.id}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading === product.id ? "#9ca3af" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: loading === product.id ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {loading === product.id ? "Redirecting…" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
        <p>
          All plans include a 30-day money-back guarantee.
          <br />
          Questions?{" "}
          <a href="mailto:support@example.com" style={{ color: "#059669" }}>
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
