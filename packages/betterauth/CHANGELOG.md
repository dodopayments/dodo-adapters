# Changelog

All notable changes to this project will be documented in this file.

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
