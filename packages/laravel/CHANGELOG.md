# Changelog

All notable changes to the Laravel adapter blueprint will be documented in this file.

## 0.1.0 (Blueprint)

- Initial scaffold of Laravel adapter under `packages/laravel/`:
  - Config (`config/dodo.php`), routes (`routes/api.php`), and `DodoServiceProvider`.
  - Controllers: `CheckoutController`, `CustomerPortalController`, `WebhookController`.
  - Middleware: `VerifyDodoWebhook` (Standard Webhooks verification).
  - Client wrapper and Facade: `Support/Client.php`, `Facades/Dodo.php`.
  - Events: Full mapping for payments, refunds, disputes, subscriptions, license.
  - Validation: FormRequests for checkout and portal.
  - Tests: PHPUnit + Orchestra Testbench (checkout, webhook).
  - Quality: Pint (style) and PHPStan (static analysis) configs.
  - CI: GitHub Actions workflow for tests, Pint, PHPStan.
  - Docs: `README.md` with install, config, routes, webhook, events.

### Notes
- Standard Webhooks is added as a dev dependency to enable webhook tests in CI.
- SDK calls in `Support/Client.php` return placeholder URLs in this monorepo; final wiring is recommended in a dedicated `dodopayments/laravel` repo with a runnable example.
