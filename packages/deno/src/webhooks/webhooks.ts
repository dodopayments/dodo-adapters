import {
  WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

// Deno doesn't have the same standardwebhooks package, so we'll implement webhook verification manually
async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const payloadBytes = encoder.encode(payload);
  
  // Create HMAC SHA-256 signature
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBytes = await crypto.subtle.sign("HMAC", key, payloadBytes);
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Parse the signature from the webhook header (format: "sha256=...")
  const receivedSignature = signature.startsWith('sha256=') ? 
    signature.slice(7) : signature;
  
  return expectedSignature === receivedSignature;
}

export const Webhook = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    const signature = req.headers.get("x-dodo-signature") || "";
    const rawBody = await req.text();

    try {
      const isValid = await verifySignature(rawBody, signature, webhookKey);
      if (!isValid) {
        return new Response("Invalid signature", { status: 401 });
      }
    } catch (err) {
      console.error("Error verifying webhook signature:", err);
      return new Response("Error while verifying webhook", { status: 500 });
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return new Response(
        `Error parsing webhook payload: ${error.message}`,
        { status: 400 }
      );
    }

    try {
      // Handle the webhook payload using the shared core function
      await handleWebhookPayload(payload, {
        webhookKey,
        ...eventHandlers,
      });
    } catch (error) {
      console.error("Error handling webhook payload:", error);
      return new Response("Error handling webhook payload", { status: 500 });
    }

    return new Response(null, { status: 200 });
  };
};