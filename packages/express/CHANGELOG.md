# Changelog

All notable changes to this project will be documented in this file.

## [0.2.12] - 2026-10-26

### Changed

- Declares `@dodopayments/core` `^0.3.16` (previously `^0.3.14`). This package bundles its own copy of core, now built from core 0.3.16, rather than loading the installed `@dodopayments/core`, so the declared version does not change the code it runs.

### Security

- Error and status responses from `checkoutHandler`, `CustomerPortal` and `Webhooks` are now sent as `text/plain`. Express sends string bodies as `text/html` by default, so error messages containing request-derived data (for example an upstream API error quoting the caller-supplied `customer_id`) were reflected as HTML, allowing cross-site scripting on the host app's origin.
- `Webhooks` now responds to a failed signature check with a fixed `401 Webhook verification failed` body instead of the verification error text. The specific reason is logged server-side with `console.error`.

### Documentation

- The README now states that `CustomerPortal` does not authenticate the caller: it creates a portal session for whatever `customer_id` is in the query string. Mount it behind your app's own authentication and check that the signed-in user owns the requested `customer_id`.
