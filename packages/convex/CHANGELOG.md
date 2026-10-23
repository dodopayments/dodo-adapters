# Changelog

All notable changes to this project will be documented in this file.

## [0.2.16] - 2026-10-22

### Changed

- The bundled `convex/server` code and generated component types are rebuilt from convex 1.47.0 (previously 1.35.1), following the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160). The `convex` peer dependency range is unchanged.
- Requires `@dodopayments/core` `^0.3.16` (previously `^0.3.14`), so installs pick up the core release built with the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160).
