/**
 * @fileoverview Server-only webhook verification implementation.
 * @description Vendored from standardwebhooks package to avoid bundling issues.
 * Uses Node.js crypto module - DO NOT import in client/browser code.
 * @internal
 */

import { createHmac, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";

const WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60; // 5 minutes

class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ExtendableError.prototype);
    this.name = "ExtendableError";
    this.stack = new Error(message).stack;
  }
}

export class WebhookVerificationError extends ExtendableError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, WebhookVerificationError.prototype);
    this.name = "WebhookVerificationError";
  }
}

export interface WebhookUnbrandedRequiredHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface WebhookOptions {
  format?: "raw";
}

export class Webhook {
  private static readonly prefix = "whsec_";
  private readonly key: Buffer;

  constructor(secret: string | Uint8Array, options?: WebhookOptions) {
    if (!secret) {
      throw new Error("Secret can't be empty.");
    }

    if (options?.format === "raw") {
      if (secret instanceof Uint8Array) {
        this.key = Buffer.from(secret);
      } else {
        this.key = Buffer.from(secret, "utf-8");
      }
    } else {
      if (typeof secret !== "string") {
        throw new Error("Expected secret to be of type string");
      }

      // Remove prefix if present
      if (secret.startsWith(Webhook.prefix)) {
        secret = secret.substring(Webhook.prefix.length);
      }

      // Decode base64 secret
      this.key = Buffer.from(secret, "base64");
    }
  }

  verify(
    payload: string | Buffer,
    headers_:
      | WebhookUnbrandedRequiredHeaders
      | Headers
      | Record<string, string | string[] | undefined>,
  ): unknown {
    // Normalize headers to lowercase, handling Headers object and string arrays
    const headers: Record<string, string> = {};
    const entries =
      headers_ instanceof Headers
        ? Array.from(headers_.entries())
        : Object.entries(
          headers_ as Record<string, string | string[] | undefined>,
        );

    for (const [key, value] of entries) {
      if (value == null) continue;
      headers[key.toLowerCase()] = Array.isArray(value)
        ? value.join(",")
        : value;
    }

    const msgId = headers["webhook-id"];
    const msgSignature = headers["webhook-signature"];
    const msgTimestamp = headers["webhook-timestamp"];

    if (!msgSignature || !msgId || !msgTimestamp) {
      throw new WebhookVerificationError("Missing required headers");
    }

    const timestamp = this.verifyTimestamp(msgTimestamp);
    const computedSignature = this.sign(msgId, timestamp, payload);
    const expectedSignature = computedSignature.split(",")[1];

    // Handle multiple spaces and trim whitespace
    const passedSignatures = msgSignature.trim().split(/\s+/);

    for (const versionedSignature of passedSignatures) {
      const [version, signature] = versionedSignature
        .split(",", 2)
        .map((s) => s.trim());

      if (version !== "v1") {
        continue;
      }

      // Use timing-safe comparison
      if (
        signature &&
        expectedSignature &&
        timingSafeEqual(signature, expectedSignature)
      ) {
        try {
          return JSON.parse(payload.toString("utf-8"));
        } catch {
          throw new WebhookVerificationError("Payload is not valid JSON");
        }
      }
    }

    throw new WebhookVerificationError("No matching signature found");
  }

  sign(msgId: string, timestamp: Date, payload: string | Buffer): string {
    let payloadStr: string;

    if (typeof payload === "string") {
      payloadStr = payload;
    } else if (Buffer.isBuffer(payload)) {
      payloadStr = payload.toString("utf-8");
    } else {
      throw new Error("Expected payload to be of type string or Buffer.");
    }

    const timestampNumber = Math.floor(timestamp.getTime() / 1000);
    const toSign = `${msgId}.${timestampNumber}.${payloadStr}`;

    // Create HMAC-SHA256 signature
    const hmac = createHmac("sha256", this.key);
    hmac.update(toSign);
    const expectedSignature = hmac.digest("base64");

    return `v1,${expectedSignature}`;
  }

  private verifyTimestamp(timestampHeader: string): Date {
    const now = Math.floor(Date.now() / 1000);
    const timestamp = parseInt(timestampHeader, 10);

    if (isNaN(timestamp)) {
      throw new WebhookVerificationError("Invalid Signature Headers");
    }

    if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
      throw new WebhookVerificationError("Message timestamp too old");
    }

    if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
      throw new WebhookVerificationError("Message timestamp too new");
    }

    return new Date(timestamp * 1000);
  }
}

/**
 * Timing-safe string comparison using Node.js crypto.timingSafeEqual
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  return cryptoTimingSafeEqual(bufA, bufB);
}
