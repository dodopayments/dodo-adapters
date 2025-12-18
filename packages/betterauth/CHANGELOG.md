# Changelog

All notable changes to this project will be documented in this file.

## [1.4.1] - 2025-12-12

### Fixed

- Fixed Next.js 16+ Turbopack build error by vendoring standardwebhooks package logic into @dodopayments/core
- Prevented Node.js crypto module from being bundled in client-side code through vendored webhook implementation

### Changed

- Webhook verification now uses vendored implementation with Node.js built-in crypto module
- Package exports now support browser-specific resolution for improved compatibility
  - Browser environments automatically receive client-safe bundles without server dependencies
  - Server environments receive full functionality including webhook verification
- Optional `/client` export path available for explicit client-side imports (backwards compatible)
- Updated hook signatures for better-auth 1.4.6 compatibility
- Added documentation clarifying server-only modules and conditional export behavior

### Technical Notes

- Webhook utilities in `@dodopayments/core/webhook` are server-only and use Node.js crypto
- Conditional package.json exports ensure browser contexts receive client-safe code automatically
- TypeScript declarations may show webhook types in both exports, but runtime JS correctly separates client/server code
- Webhook verification now handles Headers objects, string arrays, and undefined header values robustly
- JSON parsing errors are now properly wrapped in WebhookVerificationError for consistent error handling

## [1.4.0] - 2025-11-21

### Added

- Exposed the new `usage` plugin for ingesting and listing DodoPayments usage events via BetterAuth endpoints.

## [1.3.5] - 2025-11-15

### Fixed

- Do not bundle node_modules to avoid CJS bundling issues in dependent projects

## [1.3.4] - 2025-10-31

### Fixed

- Fix: switch to tsup from rollup in order to fix ESM bundling issue in dependent projects

## [1.3.2] - 2025-10-30

### Fixed

- Added 'dodo' prefix to object keys for plugins to avoid conflicts with other payment-related plugins

## [1.3.1] - 2025-10-28

### Fixed

- Added compatibility for zod v3 and v4

## [1.3.0] - 2025-10-25

### Added

- Added support for checkout sessions, deprecating the existing `checkout` method.

## [1.1.3] - 2025-09-22

### Added

- Export relevant types for use outside the adapter.

## [1.1.2] - 2025-09-01

### Fixed

- Use named exports for plugins instead of glob exports which caused issues with certain bundlers.

## [1.1.1] - 2025-07-27

### Fixed

- Specify missing `product_id` parameter for subscription checkouts.

## [1.1.0] - 2025-07-27

### Chore

- Explicitly specify `@dodopayments/core` version.

## [1.0.2] - 2025-07-27

### Fixed

- Build using `tsc` and disable CJS compilation.

## [1.0.0] - 2025-07-26

### Breaking

- Add `dodopayments` prefix to all endpoints and routes to avoid conflicts with other payment-related plugins.

## [0.1.1] - 2025-07-18

### Docs

- Improve README and documentation.

## [0.1.0] - 2025-07-18

### Added

- Initial release of the BetterAuth adapter.
