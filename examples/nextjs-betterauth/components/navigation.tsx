"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);
          setUser(session.data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setIsAuthenticated(false);
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊", authRequired: true },
    { href: "/checkout", label: "Plans", icon: "🛒" },
    {
      href: "/customer-portal",
      label: "Portal",
      icon: "🏛️",
      authRequired: true,
    },
    {
      href: "/subscriptions",
      label: "Subscriptions",
      icon: "📋",
      authRequired: true,
    },
    { href: "/payments", label: "Payments", icon: "💳", authRequired: true },
  ];

  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 0",
        marginBottom: "2rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2rem",
        }}
      >
        {/* Logo/Brand */}
        <div
          onClick={() => router.push("/")}
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#059669",
          }}
        >
          Dodo Payments
        </div>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {navItems
            .filter((item) => !item.authRequired || isAuthenticated)
            .map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  color: pathname === item.href ? "#059669" : "#374151",
                  backgroundColor:
                    pathname === item.href ? "#f0fdf4" : "transparent",
                  fontSize: "0.875rem",
                  fontWeight: pathname === item.href ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
        </div>

        {/* User Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isAuthenticated ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              >
                <span>👤</span>
                <span style={{ color: "#374151" }}>
                  {user?.name || user?.email || "User"}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "transparent",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#047857";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
