# Changelog

All notable changes to this project will be documented in this file.

## [0.2.12] - 2026-10-22

### Changed

- Module type declarations are regenerated against nuxt 3.21.11 (previously 3.17.7), following the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160). Peer dependency ranges are unchanged.
- Requires `@dodopayments/core` `^0.3.16` (previously `^0.3.14`), so installs pick up the core release built with the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160).
