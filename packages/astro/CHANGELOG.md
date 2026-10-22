# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-10-22

### Breaking

- The `astro` peer dependency is now `^7.2.8` (previously `^4.0.0 || ^5.0.0`). Astro 4, 5 and 6 are no longer supported.
- Astro 7 raises the minimum Node.js version, and the floor depends on the Astro release you install: Node.js 22.12.0+ for Astro 7.2.8 to 7.3.x, 22.22.0+ for 7.4.0 and 7.4.1, and 22.23.4+ for 7.4.2. Check the `engines.node` field of your Astro version.

### Security

- Astro releases before 7.2.8 are affected by published advisories, including:
  - [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) (critical): remote code execution through AVIF image optimization, fixed in 7.2.8.
  - [GHSA-2pvr-wf23-7pc7](https://github.com/advisories/GHSA-2pvr-wf23-7pc7) (high): Host header SSRF in prerendered error page fetch, fixed in 6.4.6.
  - [GHSA-8hv8-536x-4wqp](https://github.com/advisories/GHSA-8hv8-536x-4wqp) (high): reflected XSS via unescaped slot name, fixed in 6.3.3.
  - Several medium and low severity XSS, replay and authorization-bypass advisories fixed between 6.1.6 and 7.2.4.

  Raising the minimum supported version to 7.2.8 makes sure apps installing this adapter run a patched Astro.

### Migration

- Upgrade Astro to 7.2.8 or later, for example with `npx @astrojs/upgrade`, and follow the [Astro upgrade guides](https://docs.astro.build/en/upgrade-astro/) for your app.
- The adapter API (`Checkout`, `CustomerPortal`, `Webhooks`) is unchanged. No code changes are needed in your route handlers.
