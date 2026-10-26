# Changelog

All notable changes to this project will be documented in this file.

## [0.2.16] - 2026-10-26

### Changed

- The bundled `convex/server` code and generated component types are rebuilt from convex 1.47.0 (previously 1.35.1), following the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160). The `convex` peer dependency range is unchanged.
- Declares `@dodopayments/core` `^0.3.16` (previously `^0.3.14`). This package bundles its own copy of core, now built from core 0.3.16, rather than loading the installed `@dodopayments/core`, so the declared version does not change the code it runs.
