# Changelog

All notable changes to this project will be documented in this file.

## [0.3.10] - 2026-10-22

### Changed

- Requires `@dodopayments/core` `^0.3.16` (previously `^0.3.14`), so installs pick up the core release built with the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160).

### Security

- The Next.js code bundled into this package is rebuilt from next 16.4.2 (previously 16.0.10), which includes upstream security fixes, following the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160). The `next` peer dependency range is unchanged.
