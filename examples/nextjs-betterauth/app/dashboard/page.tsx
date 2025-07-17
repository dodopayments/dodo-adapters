"use client";

import { UserProfile } from "@/components/user-profile";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const quickActions = [
    {
      title: "Browse Plans",
      description: "Explore our subscription plans and start your journey",
      icon: "🛒",
      href: "/checkout",
      color: "#059669",
      bgColor: "#f0fdf4",
    },
    {
      title: "Customer Portal",
      description: "Manage your account, billing, and subscription settings",
      icon: "🏛️",
      href: "/customer-portal",
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "My Subscriptions",
      description: "View and manage your active subscriptions",
      icon: "📋",
      href: "/subscriptions",
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Payment History",
      description: "View your payment history and download receipts",
      icon: "💳",
      href: "/payments",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
    },
  ];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <UserProfile />
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "2rem", marginBottom: "1rem", color: "#1f2937" }}
        >
          Quick Actions
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Access your most important features with just one click.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {quickActions.map((action) => (
            <div
              key={action.href}
              onClick={() => router.push(action.href)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "2rem",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  backgroundColor: action.color,
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: action.bgColor,
                    borderRadius: "12px",
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {action.title}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {action.description}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    color: action.color,
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <h3
          style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1f2937" }}
        >
          🔔 What's New
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <h4 style={{ color: "#059669", marginBottom: "0.5rem" }}>
              ✨ Enhanced Portal
            </h4>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              New customer portal with improved subscription management and
              billing controls.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem" }}>
              📊 Payment Analytics
            </h4>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Detailed payment history with filtering options and downloadable
              receipts.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.5rem" }}>
              🚀 One-Click Actions
            </h4>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Quick access to all your important features right from the
              dashboard.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "0.875rem",
          }}
        >
          Need help? Check out our{" "}
          <a href="/docs" style={{ color: "#059669" }}>
            documentation
          </a>{" "}
          or{" "}
          <a href="/support" style={{ color: "#059669" }}>
            contact support
          </a>
          .
        </div>
      </div>
    </main>
  );
}
