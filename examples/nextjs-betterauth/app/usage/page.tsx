"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { EventsDefaultPageNumberPagination } from "dodopayments/resources/usage-events.mjs";

type UsageEvent = EventsDefaultPageNumberPagination["items"][number];

export default function UsagePage() {
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadUsage();
  }, []);

  const loadUsage = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.dodopayments.usage.meters.list({
        query: { page_size: 20 },
      });

      if (result.data) {
        setUsageEvents(result.data.items ?? []);
      } else {
        throw new Error(result.error?.message ?? "No usage data returned");
      }
    } catch (err) {
      console.error("Usage load error:", err);
      setError("Failed to load usage history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recordSampleUsage = async () => {
    setIngesting(true);
    setError(null);

    try {
      await authClient.dodopayments.usage.ingest({
        event_id: crypto.randomUUID(),
        event_name: "api_request",
        metadata: {
          route: "/usage-demo",
          method: "GET",
        },
      });

      await loadUsage();
    } catch (err) {
      console.error("Usage ingest error:", err);
      setError("Failed to record usage. Please try again.");
    } finally {
      setIngesting(false);
    }
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#6366f1", fontWeight: 600, letterSpacing: 1 }}>
          Usage &amp; Metering
        </p>
        <h1 style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>
          Track API Requests per Customer
        </h1>
        <p style={{ color: "#4b5563", maxWidth: "60ch" }}>
          The BetterAuth usage plugin forwards events to the API Requests meter
          (meter id: <code>mtr_besosGhQqsSwpekfi3vJk</code>) so that each
          subscription on the Builder or Scale plans can bill per request beyond
          the included allowance.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={recordSampleUsage}
          disabled={ingesting}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: ingesting ? "#9ca3af" : "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: ingesting ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {ingesting ? "Recording…" : "Record Sample Usage"}
        </button>

        <button
          onClick={() => void loadUsage()}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "transparent",
            color: "#111827",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing…" : "Refresh Usage"}
        </button>
      </section>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Recent Usage</h2>
          <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Showing the latest {usageEvents.length} events
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading…</div>
        ) : usageEvents.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              border: "1px dashed #d1d5db",
              borderRadius: "8px",
              textAlign: "center",
              color: "#4b5563",
            }}
          >
            No usage records yet. Trigger the button above to ingest a sample
            API request.
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                <tr>
                  <th style={{ padding: "0.75rem", fontSize: "0.85rem" }}>
                    Timestamp
                  </th>
                  <th style={{ padding: "0.75rem", fontSize: "0.85rem" }}>
                    Event
                  </th>
                  <th style={{ padding: "0.75rem", fontSize: "0.85rem" }}>
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody>
                {usageEvents.map((event) => (
                  <tr
                    key={event.event_id}
                    style={{ borderTop: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                      <strong>{event.event_name}</strong>
                      <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        event_id: <code>{event.event_id}</code>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                      {renderMetadata(event.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function renderMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span style={{ color: "#9ca3af" }}>—</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {Object.entries(metadata).map(([key, value]) => (
        <span key={key} style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
          {key}: {String(value)}
        </span>
      ))}
    </div>
  );
}
