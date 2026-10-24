# Changelog

All notable changes to this project will be documented in this file.

## [0.2.12] - 2026-10-22

### Changed

- Requires `@dodopayments/core` `^0.3.16` (previously `^0.3.14`), so installs pick up the core release built with the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160).

### Security

- Error and status responses from `checkoutHandler`, `CustomerPortal` and `Webhooks` are now sent as `text/plain`. Express sends string bodies as `text/html` by default, so error messages containing request-derived data (for example an upstream API error quoting the caller-supplied `customer_id`) were reflected as HTML, allowing cross-site scripting on the host app's origin.
- `Webhooks` now responds to a failed signature check with a fixed `401 Webhook verification failed` body instead of the verification error text. The specific reason is logged server-side with `console.error`.

### Documentation

- The README now states that `CustomerPortal` does not authenticate the caller: it creates a portal session for whatever `customer_id` is in the query string. Mount it behind your app's own authentication and check that the signed-in user owns the requested `customer_id`.
