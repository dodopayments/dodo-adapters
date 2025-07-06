import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export interface WebhookRequest {
  method: string;
  headers: Record<string, string>;
  body: string;
}

export interface WebhookResponse {
  status_code: number;
  content?: string;
}

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (request: WebhookRequest): Promise<WebhookResponse> => {
    if (request.method !== "POST") {
      return {
        status_code: 405,
        content: "Method not allowed. Use POST",
      };
    }

    const rawBody = request.body;
    const headers = request.headers;

    try {
      standardWebhook.verify(rawBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return {
          status_code: 401,
          content: err.message,
        };
      }

      return {
        status_code: 500,
        content: "Error while verifying webhook",
      };
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return {
        status_code: 400,
        content: `Error parsing webhook payload: ${error.message}`,
      };
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return {
      status_code: 200,
    };
  };
};

// Helper function to create a FastAPI route handler
export const createWebhookRoute = (config: WebhookHandlerConfig) => {
  const handler = Webhooks(config);

  return `
from fastapi import Request, HTTPException
from fastapi.responses import Response
import json

async def webhook_handler(request: Request):
    """
    FastAPI route handler for Dodo Payments webhooks.
    
    Usage:
    from your_fastapi_app import app
    
    @app.post("/api/webhook/dodo-payments")
    async def webhook(request: Request):
        return await webhook_handler(request)
    """
    
    # Convert FastAPI request to our format
    body = await request.body()
    fastapi_request = {
        "method": request.method,
        "headers": dict(request.headers),
        "body": body.decode("utf-8")
    }
    
    # Call the TypeScript handler logic (this would be implemented in Python)
    # For now, this is a template that shows the structure
    
    try:
        # This would call the actual webhook logic
        result = await handle_webhook_payload(fastapi_request, ${JSON.stringify(config)})
        return Response(content=result.get("content", ""), status_code=result["status_code"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
`;
};
