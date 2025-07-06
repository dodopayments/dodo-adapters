# `@dodo/fastapi`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A TypeScript/Python library that exports handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your FastAPI application.

## Installation

You can install this package via npm for the TypeScript definitions and Python dependencies:

```bash
npm install @dodo/fastapi
```

For Python dependencies:

```bash
pip install fastapi dodopayments standardwebhooks
```

## Quick Start

All the examples below assume you're using FastAPI with Python 3.8+.

### 1. Checkout Route Handler

```python
# main.py or your FastAPI app
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import os
from dodopayments import DodoPayments
from typing import Dict, Any

app = FastAPI()

@app.get("/checkout")
async def checkout(request: Request):
    """
    Checkout route handler for Dodo Payments.
    Redirects users to the Dodo Payments checkout page.
    """
    query_params = dict(request.query_params)

    # Validate required parameters
    if "productId" not in query_params:
        return {"error": "Please provide productId query parameter"}, 400

    # Configuration
    config = {
        "bearerToken": os.getenv("DODO_PAYMENTS_API_KEY"),
        "environment": "test_mode",  # or "live_mode" for production
        "successUrl": os.getenv("SUCCESS_URL"),  # optional
    }

    try:
        # Build checkout URL using the core logic
        checkout_url = await build_checkout_url(query_params, config)
        return RedirectResponse(url=checkout_url, status_code=302)
    except Exception as e:
        return {"error": str(e)}, 400
```

#### Query Parameters

The checkout route supports the following query parameters:

- `productId` - Product identifier (required, e.g., `?productId=pdt_nZuwz45WAs64n3l07zpQR`)
- `quantity` - Quantity of the product (optional, e.g., `?quantity=1`)

**Customer Fields (optional):**

- `fullName` - Customer's full name (e.g., `?fullName=John%20Doe`)
- `firstName` - Customer's first name (e.g., `?firstName=John`)
- `lastName` - Customer's last name (e.g., `?lastName=Doe`)
- `email` - Customer's email address (e.g., `?email=john.doe@example.com`)
- `country` - Customer's country (e.g., `?country=US`)
- `addressLine` - Customer's address line (e.g., `?addressLine=123%20Main%20St`)
- `city` - Customer's city (e.g., `?city=Anytown`)
- `state` - Customer's state/province (e.g., `?state=CA`)
- `zipCode` - Customer's zip/postal code (e.g., `?zipCode=90210`)

**Disable Flags (optional, set to `true` to disable):**

- `disableFullName` - Disable full name field (e.g., `?disableFullName=true`)
- `disableFirstName` - Disable first name field (e.g., `?disableFirstName=true`)
- `disableLastName` - Disable last name field (e.g., `?disableLastName=true`)
- `disableEmail` - Disable email field (e.g., `?disableEmail=true`)
- `disableCountry` - Disable country field (e.g., `?disableCountry=true`)
- `disableAddressLine` - Disable address line field (e.g., `?disableAddressLine=true`)
- `disableCity` - Disable city field (e.g., `?disableCity=true`)
- `disableState` - Disable state field (e.g., `?disableState=true`)
- `disableZipCode` - Disable zip code field (e.g., `?disableZipCode=true`)

**Advanced Controls (optional):**

- `paymentCurrency` - Specify the payment currency (e.g., `?paymentCurrency=USD`)
- `showCurrencySelector` - Show currency selector (e.g., `?showCurrencySelector=true`)
- `paymentAmount` - Specify the payment amount (e.g., `?paymentAmount=1000` for $10.00)
- `showDiscounts` - Show discount fields (e.g., `?showDiscounts=true`)

**Metadata (optional):**
Any query parameter starting with `metadata_` will be passed as metadata to the checkout.
(e.g., `?metadata_userId=abc123&metadata_campaign=summer_sale`)

If the `productId` is missing, the handler will return a 400 response. Invalid query parameters will also result in a 400 response.

### 2. Customer Portal Route Handler

```python
# main.py or your FastAPI app
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import os
from dodopayments import DodoPayments

app = FastAPI()

async def get_customer_id(request: Request) -> str:
    """
    Extract customer ID from the request.
    Implement your authentication logic here.
    """
    # Example: Extract from JWT token, session, or database
    # This is where you'd implement your customer identification logic
    # For example, from a JWT token:
    # token = request.headers.get("Authorization")
    # decoded = jwt.decode(token, secret_key)
    # return decoded["customer_id"]

    # Placeholder implementation
    return "customer_id_placeholder"

@app.get("/customer-portal")
async def customer_portal(request: Request):
    """
    Customer portal route handler for Dodo Payments.
    Redirects authenticated users to their customer portal.
    """
    try:
        customer_id = await get_customer_id(request)

        dodopayments = DodoPayments(
            bearer_token=os.getenv("DODO_PAYMENTS_API_KEY"),
            environment="test_mode"  # or "live_mode" for production
        )

        session = await dodopayments.customers.customer_portal.create(customer_id)
        return RedirectResponse(url=session.link, status_code=302)
    except Exception as e:
        return {"error": f"Failed to create customer portal session: {str(e)}"}, 500
```

### 3. Webhook Route Handler

```python
# main.py or your FastAPI app
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import Response
import os
import json
from standardwebhooks import Webhook as StandardWebhook, WebhookVerificationError

app = FastAPI()

@app.post("/api/webhook/dodo-payments")
async def webhook(request: Request):
    """
    Webhook route handler for Dodo Payments.
    Processes incoming webhook events from Dodo Payments.
    """
    webhook_secret = os.getenv("DODO_WEBHOOK_SECRET")

    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    # Get the raw body and headers
    body = await request.body()
    headers = dict(request.headers)

    # Verify the webhook signature
    standard_webhook = StandardWebhook(webhook_secret)

    try:
        standard_webhook.verify(body, headers)
    except WebhookVerificationError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error while verifying webhook")

    # Parse the payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Handle the webhook payload
    await handle_webhook_payload(payload)

    return Response(status_code=200)

async def handle_webhook_payload(payload):
    """
    Handle the webhook payload based on event type.
    """
    event_type = payload.get("type")

    if event_type == "payment.succeeded":
        await handle_payment_succeeded(payload)
    elif event_type == "payment.failed":
        await handle_payment_failed(payload)
    elif event_type == "subscription.active":
        await handle_subscription_active(payload)
    # Add more event handlers as needed

async def handle_payment_succeeded(payload):
    """Handle successful payment event."""
    print(f"Payment succeeded: {payload}")
    # Implement your business logic here

async def handle_payment_failed(payload):
    """Handle failed payment event."""
    print(f"Payment failed: {payload}")
    # Implement your business logic here

async def handle_subscription_active(payload):
    """Handle active subscription event."""
    print(f"Subscription active: {payload}")
    # Implement your business logic here
```

#### Supported Webhook Event Types

The webhook handler can process various event types. Here are the supported event types:

- `payment.succeeded` - Payment completed successfully
- `payment.failed` - Payment failed
- `payment.processing` - Payment is being processed
- `payment.cancelled` - Payment was cancelled
- `refund.succeeded` - Refund completed successfully
- `refund.failed` - Refund failed
- `dispute.opened` - Dispute was opened
- `dispute.expired` - Dispute expired
- `dispute.accepted` - Dispute was accepted
- `dispute.cancelled` - Dispute was cancelled
- `dispute.challenged` - Dispute was challenged
- `dispute.won` - Dispute was won
- `dispute.lost` - Dispute was lost
- `subscription.active` - Subscription is active
- `subscription.on_hold` - Subscription is on hold
- `subscription.renewed` - Subscription was renewed
- `subscription.paused` - Subscription was paused
- `subscription.plan_changed` - Subscription plan was changed
- `subscription.cancelled` - Subscription was cancelled
- `subscription.failed` - Subscription failed
- `subscription.expired` - Subscription expired
- `license_key.created` - License key was created

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **Python** - Runtime implementation
- **FastAPI** - Modern, fast web framework for Python

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/fastapi
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/fastapi
```

## Environment Variables

You should set the following environment variables:

```env
DODO_PAYMENTS_API_KEY=your-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret
SUCCESS_URL=https://yourapp.com/success
```

## Python Dependencies

Make sure to install these Python packages:

```bash
pip install fastapi dodopayments standardwebhooks uvicorn
```

## Running Your FastAPI Application

To run your FastAPI application:

```bash
uvicorn main:app --reload
```

## Integration with Existing FastAPI Applications

If you have an existing FastAPI application, you can easily integrate the Dodo Payments handlers:

```python
from fastapi import FastAPI
from your_existing_app import app  # Your existing FastAPI app

# Add the Dodo Payments routes to your existing app
# Copy the route handlers from the examples above

# Your existing routes will continue to work
@app.get("/")
async def root():
    return {"message": "Hello World"}

# Run with: uvicorn your_existing_app:app --reload
```

## Error Handling

The handlers include comprehensive error handling:

- **400 Bad Request**: Invalid parameters or missing required fields
- **401 Unauthorized**: Invalid webhook signature
- **404 Not Found**: Product not found
- **500 Internal Server Error**: Server-side errors

## Security Considerations

- Always validate webhook signatures using the webhook secret
- Use HTTPS in production
- Store sensitive configuration in environment variables
- Implement proper authentication for customer portal access
- Validate and sanitize all user inputs

## TypeScript Support

This package includes TypeScript definitions for better development experience when working with the Python implementation. The TypeScript interfaces help ensure type safety when configuring the handlers.
