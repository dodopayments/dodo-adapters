import { describe, it, expect, vi } from "vitest";
import { handleWebhookPayload } from "./webhook";
import type { WebhookHandlerConfig } from "./webhook";
import type { WebhookPayload } from "../schemas/webhook";

describe("handleWebhookPayload", () => {
  it("should call onPayload for any event type", async () => {
    const onPayload = vi.fn().mockResolvedValue(undefined);
    const config: WebhookHandlerConfig = {
      webhookKey: "wh_123",
      onPayload,
    };
    const payload: WebhookPayload = { type: "payment.succeeded" } as any;

    await handleWebhookPayload(payload, config);

    expect(onPayload).toHaveBeenCalledWith(payload);
  });

  const eventHandlerMap: [string, keyof WebhookHandlerConfig][] = [
    ["payment.succeeded", "onPaymentSucceeded"],
    ["payment.failed", "onPaymentFailed"],
    ["payment.processing", "onPaymentProcessing"],
    ["payment.cancelled", "onPaymentCancelled"],
    ["refund.succeeded", "onRefundSucceeded"],
    ["refund.failed", "onRefundFailed"],
    ["dispute.opened", "onDisputeOpened"],
    ["dispute.expired", "onDisputeExpired"],
    ["dispute.accepted", "onDisputeAccepted"],
    ["dispute.cancelled", "onDisputeCancelled"],
    ["dispute.challenged", "onDisputeChallenged"],
    ["dispute.won", "onDisputeWon"],
    ["dispute.lost", "onDisputeLost"],
    ["subscription.active", "onSubscriptionActive"],
    ["subscription.on_hold", "onSubscriptionOnHold"],
    ["subscription.renewed", "onSubscriptionRenewed"],
    ["subscription.paused", "onSubscriptionPaused"],
    ["subscription.plan_changed", "onSubscriptionPlanChanged"],
    ["subscription.cancelled", "onSubscriptionCancelled"],
    ["subscription.failed", "onSubscriptionFailed"],
    ["subscription.expired", "onSubscriptionExpired"],
    ["license_key.created", "onLicenseKeyCreated"],
  ];

  it.each(eventHandlerMap)(
    "should call %s handler for %s event",
    async (eventType, handlerName) => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const config = {
        webhookKey: "wh_123",
        [handlerName]: handler,
      };
      const payload = { type: eventType } as any;

      await handleWebhookPayload(payload, config as WebhookHandlerConfig);

      expect(handler).toHaveBeenCalledWith(payload);
      expect(handler).toHaveBeenCalledTimes(1);
    },
  );

  it("should call both onPayload and specific event handler", async () => {
    const onPayload = vi.fn().mockResolvedValue(undefined);
    const onPaymentSucceeded = vi.fn().mockResolvedValue(undefined);
    const config: WebhookHandlerConfig = {
      webhookKey: "wh_123",
      onPayload,
      onPaymentSucceeded,
    };
    const payload: WebhookPayload = { type: "payment.succeeded" } as any;

    await handleWebhookPayload(payload, config);

    expect(onPayload).toHaveBeenCalledWith(payload);
    expect(onPaymentSucceeded).toHaveBeenCalledWith(payload);
  });

  it("should not throw if no handler is provided", async () => {
    const config: WebhookHandlerConfig = {
      webhookKey: "wh_123",
    };
    const payload: WebhookPayload = { type: "payment.succeeded" } as any;

    await expect(
      handleWebhookPayload(payload, config),
    ).resolves.toBeUndefined();
  });

  it("should not call other handlers", async () => {
    const onPaymentSucceeded = vi.fn().mockResolvedValue(undefined);
    const onPaymentFailed = vi.fn().mockResolvedValue(undefined);
    const config: WebhookHandlerConfig = {
      webhookKey: "wh_123",
      onPaymentSucceeded,
      onPaymentFailed,
    };
    const payload: WebhookPayload = { type: "payment.succeeded" } as any;

    await handleWebhookPayload(payload, config);

    expect(onPaymentSucceeded).toHaveBeenCalledWith(payload);
    expect(onPaymentSucceeded).toHaveBeenCalledTimes(1);
    expect(onPaymentFailed).not.toHaveBeenCalled();
  });
});
