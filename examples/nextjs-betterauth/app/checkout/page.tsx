"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Real product data from DodoPayments
const products = [
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

interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "US",
  });
  const [billingErrors, setBillingErrors] = useState<Partial<BillingInfo>>({});
  const router = useRouter();

  const validateBillingInfo = (): boolean => {
    const errors: Partial<BillingInfo> = {};

    if (!billingInfo.name.trim()) errors.name = "Name is required";
    if (!billingInfo.email.trim()) errors.email = "Email is required";
    if (!billingInfo.email.includes("@"))
      errors.email = "Please enter a valid email";
    if (!billingInfo.street.trim())
      errors.street = "Street address is required";
    if (!billingInfo.city.trim()) errors.city = "City is required";
    if (!billingInfo.state.trim()) errors.state = "State is required";
    if (!billingInfo.zipcode.trim()) errors.zipcode = "Zip code is required";
    if (!billingInfo.country.trim()) errors.country = "Country is required";

    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (billingErrors[field]) {
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckout = async (productId: string) => {
    if (!validateBillingInfo()) {
      setError("Please fill in all required billing information");
      return;
    }

    try {
      setLoading(productId);
      setError(null);

      // Use the real product ID from DodoPayments with billing info
      const result = await authClient.checkout({
        product_id: productId,
        quantity: 1,
        customer: {
          email: billingInfo.email,
          name: billingInfo.name,
        },
        billing: {
          phone: billingInfo.phone,
          street: billingInfo.street,
          city: billingInfo.city,
          state: billingInfo.state,
          zipcode: billingInfo.zipcode,
          country: billingInfo.country,
        },
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

      {/* Billing Information Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "3rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#1a1a1a",
          }}
        >
          Billing Information
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              value={billingInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.name
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.name
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="Enter your full name"
            />
            {billingErrors.name && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.name}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.email
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.email
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="your@email.com"
            />
            {billingErrors.email && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.email}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={billingInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Street Address *
            </label>
            <input
              type="text"
              value={billingInfo.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.street
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.street
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="123 Main St, Apt 4B"
            />
            {billingErrors.street && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.street}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              City *
            </label>
            <input
              type="text"
              value={billingInfo.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.city
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.city
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="New York"
            />
            {billingErrors.city && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.city}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              State/Province *
            </label>
            <input
              type="text"
              value={billingInfo.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.state
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.state
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="NY"
            />
            {billingErrors.state && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.state}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              ZIP/Postal Code *
            </label>
            <input
              type="text"
              value={billingInfo.zipcode}
              onChange={(e) => handleInputChange("zipcode", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.zipcode
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.zipcode
                  ? "#ef4444"
                  : "#d1d5db")
              }
              placeholder="10001"
            />
            {billingErrors.zipcode && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.zipcode}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Country *
            </label>
            <select
              value={billingInfo.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: billingErrors.country
                  ? "2px solid #ef4444"
                  : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#059669")}
              onBlur={(e) =>
                (e.target.style.borderColor = billingErrors.country
                  ? "#ef4444"
                  : "#d1d5db")
              }
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
              <option value="JP">Japan</option>
              <option value="BR">Brazil</option>
              <option value="MX">Mexico</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="SE">Sweden</option>
              <option value="NO">Norway</option>
              <option value="DK">Denmark</option>
              <option value="FI">Finland</option>
              <option value="CH">Switzerland</option>
              <option value="AT">Austria</option>
              <option value="BE">Belgium</option>
            </select>
            {billingErrors.country && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {billingErrors.country}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          Choose Your Plan
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {products.map((product) => (
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
