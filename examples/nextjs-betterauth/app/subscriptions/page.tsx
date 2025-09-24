"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { SubscriptionListResponse } from "dodopayments/resources.js";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<
    SubscriptionListResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "cancelled">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
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

  // Load subscriptions
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptions();
    }
  }, [isAuthenticated, filter, page]);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.dodopayments.customer.subscriptions.list({
        query: {
          page,
          limit: 10,
          status:
            filter === "active"
              ? "active"
              : filter === "cancelled"
                ? "cancelled"
                : undefined,
        },
      });

      if (result.data) {
        const data = result.data;
        setSubscriptions(
          page === 1 ? data.items : [...subscriptions, ...data.items],
        );
        setHasMore(false); // Simplified for demo
      } else {
        throw new Error("No subscription data received");
      }
    } catch (err) {
      console.error("Subscriptions error:", err);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#059669";
      case "cancelled":
        return "#dc2626";
      case "past_due":
        return "#f59e0b";
      case "trialing":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <main
        style={{
          maxWidth: 1200,
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
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Subscriptions
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You need to be signed in to view your subscriptions.
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
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          My Subscriptions
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>
          Manage your active subscriptions and view billing history.
        </p>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {(["all", "active", "cancelled"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => {
                setFilter(filterOption);
                setPage(1);
                setSubscriptions([]);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor:
                  filter === filterOption ? "#059669" : "transparent",
                color: filter === filterOption ? "white" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {filterOption} Subscriptions
            </button>
          ))}
        </div>
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

      {loading && subscriptions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>
            Loading subscriptions...
          </div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            No Subscriptions Found
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            {filter === "all"
              ? "You don't have any subscriptions yet."
              : `You don't have any ${filter} subscriptions.`}
          </p>
          <button
            onClick={() => router.push("/checkout")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Browse Plans
          </button>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {subscriptions.map((subscription) => (
            <div
              key={subscription.subscription_id}
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {subscription.product_id}
                  </h3>
                  <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
                    {subscription.status}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      backgroundColor:
                        getStatusColor(subscription.status) + "20",
                      color: getStatusColor(subscription.status),
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    {subscription.status.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    per {subscription.payment_frequency_interval}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                }}
              >
                {subscription.cancel_at_next_billing_date && (
                  <div>
                    <strong>Cancels At Next Billing Date:</strong>
                    <br />
                  </div>
                )}
                {subscription.cancelled_at && (
                  <div>
                    <strong>Cancelled At:</strong>
                    <br />
                    {formatDate(subscription.cancelled_at)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasMore && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: loading ? "#9ca3af" : "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={() => router.push("/customer-portal")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Manage in Portal
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
