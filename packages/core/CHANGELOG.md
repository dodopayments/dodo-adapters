# Changelog

All notable changes to this project will be documented in this file.

## [0.3.16] - 2026-10-22

### Fixed

- Test files are no longer included in the published package. The build previously compiled `*.test.ts` files into `dist`, bundling Vitest internals and `magic-string` alongside them, which made the unpacked `dist` about 12 MB. It is now about 3.9 MB. The public entry points (`.`, `./checkout`, `./webhook`, `./schemas`) and their exports are unchanged.
