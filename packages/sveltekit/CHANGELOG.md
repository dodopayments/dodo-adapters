# Changelog

All notable changes to this project will be documented in this file.

## [0.2.11] - 2026-10-26

### Changed

- Declares `@dodopayments/core` `^0.3.16` (previously `^0.3.14`). This package bundles its own copy of core, now built from core 0.3.16, rather than loading the installed `@dodopayments/core`, so the declared version does not change the code it runs.

### Security

- The `@sveltejs/kit` code bundled into this package is rebuilt from @sveltejs/kit 2.70.3 (previously 2.25.1), which includes upstream security fixes, following the dependency security updates in [#160](https://github.com/dodopayments/dodo-adapters/pull/160). The `@sveltejs/kit` peer dependency range is unchanged.

### Documentation

- The README now states that the customer portal handler does not authenticate the caller: it creates a portal session for whatever `customer_id` is in the query string. Mount it behind your app's own authentication and check that the signed-in user owns the requested `customer_id`.
