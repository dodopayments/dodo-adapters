"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { PaymentListResponse } from "dodopayments/resources";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"all" | "succeeded" | "failed">("all");
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

  // Load payments
  useEffect(() => {
    if (isAuthenticated) {
      loadPayments();
    }
  }, [isAuthenticated, filter, page]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.dodopayments.customer.payments.list({
        query: {
          page,
          limit: 10,
          status: filter === "all" ? undefined : filter,
        },
      });

      if (result.data) {
        const data = result.data;
        setPayments(page === 1 ? data.items : [...payments, ...data.items]);
        setHasMore(false); // Simplified for demo
      } else {
        throw new Error("No payment data received");
      }
    } catch (err) {
      console.error("Payments error:", err);
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "succeeded":
        return "#059669";
      case "failed":
        return "#dc2626";
      case "cancelled":
        return "#6b7280";
      case "processing":
        return "#f59e0b";
      case "requires_customer_action":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "succeeded":
        return "✅";
      case "failed":
        return "❌";
      case "cancelled":
        return "🚫";
      case "processing":
        return "⏳";
      case "requires_customer_action":
        return "⚠️";
      default:
        return "📋";
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
            Payment History
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You need to be signed in to view your payment history.
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
          Payment History
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>
          View all your payment transactions and download receipts.
        </p>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {(["all", "succeeded", "failed"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => {
                setFilter(filterOption);
                setPage(1);
                setPayments([]);
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
              {filterOption} Payments
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

      {loading && payments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>
            Loading payment history...
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            No Payments Found
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            {filter === "all"
              ? "You haven't made any payments yet."
              : `You don't have any ${filter} payments.`}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {payments.map((payment) => (
            <div
              key={payment.payment_id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div style={{ fontSize: "2rem" }}>
                    {getStatusIcon(payment.status ?? "")}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Payment #{payment.payment_id.slice(-8)}
                    </h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.25rem 0.75rem",
                        backgroundColor:
                          getStatusColor(payment.status ?? "") + "20",
                        color: getStatusColor(payment.status ?? ""),
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {payment.status?.toUpperCase().replace("_", " ")}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color:
                        payment.status === "succeeded" ? "#059669" : "#374151",
                    }}
                  >
                    {formatCurrency(payment.total_amount, payment.currency)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {formatDate(payment.created_at)}
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
                {payment.customer && (
                  <div>
                    <strong>Customer:</strong>
                    <br />
                    {payment.customer.email}
                  </div>
                )}
                {payment.payment_method && (
                  <div>
                    <strong>Payment Method:</strong>
                    <br />
                    {payment.payment_method_type} ••••{" "}
                  </div>
                )}
                {payment.customer && (
                  <div>
                    <strong>Billing:</strong>
                    <br />
                    {payment.customer.email}
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
          onClick={() => router.push("/subscriptions")}
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
          View Subscriptions
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
