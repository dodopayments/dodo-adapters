# Changelog

All notable changes to this project will be documented in this file.

## [0.1.6] - 2026-10-26

### Changed

- Raises the declared `@dodopayments/core` dependency to `^0.3.16` (previously `^0.3.14`). This package bundles its own copy of core rather than loading the installed one, so this has no effect at runtime. The built code is functionally unchanged from 0.1.5: the only difference is the name of an internal bundler helper.

### Documentation

- The README now states that the customer portal handler does not authenticate the caller: it creates a portal session for whatever `customer_id` is in the query string. Mount it behind your app's own authentication and check that the signed-in user owns the requested `customer_id`.
