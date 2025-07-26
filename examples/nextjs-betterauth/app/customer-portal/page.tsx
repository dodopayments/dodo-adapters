"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleOpenPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.dodopayments.customer.portal();

      if (result.data && result.data.redirect && result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (err) {
      console.error("Portal error:", err);
      setError("Failed to open customer portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>Loading...</div>
      </main>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Customer Portal
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You need to be signed in to access your customer portal.
          </p>

          <button
            onClick={() => router.push("/auth")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginRight: "1rem",
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Customer Portal
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>
          Manage your account, subscriptions, and billing information.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* Portal Access Card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏛️</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Customer Portal
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "2rem",
              lineHeight: "1.5",
            }}
          >
            Access your complete customer portal to manage subscriptions, update
            payment methods, view invoices, and more.
          </p>
          <button
            onClick={handleOpenPortal}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              backgroundColor: loading ? "#9ca3af" : "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Opening Portal..." : "Open Customer Portal"}
          </button>
        </div>

        {/* Quick Actions Card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "2rem",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            ⚡
          </div>
          <h3
            style={{
              fontSize: "1.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Quick Actions
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <button
              onClick={() => router.push("/subscriptions")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "transparent",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              📋 View Subscriptions
            </button>
            <button
              onClick={() => router.push("/payments")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "transparent",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              💳 Payment History
            </button>
            <button
              onClick={() => router.push("/checkout")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "transparent",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              🛒 Browse Plans
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>🔒 Secure Portal Features</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              ✅ Update payment methods
            </li>
            <li style={{ marginBottom: "0.5rem" }}>✅ Manage subscriptions</li>
            <li style={{ marginBottom: "0.5rem" }}>✅ Download invoices</li>
          </ul>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>✅ View payment history</li>
            <li style={{ marginBottom: "0.5rem" }}>
              ✅ Update billing address
            </li>
            <li style={{ marginBottom: "0.5rem" }}>✅ Cancel subscriptions</li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "transparent",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
