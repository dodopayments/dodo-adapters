# Contributing to Dodo Adapters

Thank you for your interest in contributing to Dodo Adapters! This document provides guidelines for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Adding New Framework Adapters](#adding-new-framework-adapters)
- [Coding Standards](#coding-standards)
- [Documentation Guidelines](#documentation-guidelines)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- TypeScript knowledge
- Familiarity with at least one supported web framework

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/dodo-adapters.git
   cd dodo-adapters
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build All Packages**
   ```bash
   npm run build
   ```

 4. **Local Testing**
    ```bash
    # Build and link the adapter you want to test
    cd packages/nextjs  # or any other adapter
    npm run build
    npm link

    # In your test project
    npm link @dodopayments/nextjs
    ```

### Project Structure

```
packages/
├── core/                  # Shared functionality
├── [framework]/           # Framework-specific adapters
examples/
├── [framework]-basic/     # Basic implementations
└── [framework]-auth/      # Authentication examples
```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **🐛 Bug Fixes** - Fix issues in existing adapters
2. **✨ New Features** - Add functionality to existing adapters
3. **🚀 New Adapters** - Add support for new frameworks
4. **📚 Documentation** - Improve or add documentation
5. **🎨 Examples** - Create new example implementations

### Before You Start

1. **Check Existing Issues** - Look for existing issues or discussions
2. **Create an Issue** - For new features or significant changes
3. **Discuss Approach** - Get feedback before starting work
4. **Check Dependencies** - Ensure your changes don't break existing functionality

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or  
git checkout -b adapter/framework-name
```

### 2. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Update documentation as needed

### 3. Commit Your Changes

We use conventional commits for consistency:

```bash
# Features
git commit -m "feat(nextjs): add support for server actions"
git commit -m "feat: add fastify adapter"

# Bug fixes
git commit -m "fix(webhooks): handle malformed signature headers"
git commit -m "fix(core): validation error for empty metadata"

# Documentation
git commit -m "docs(readme): update installation instructions"
git commit -m "docs: add troubleshooting guide"

# Chores
git commit -m "chore: update dependencies"
```

### 4. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a pull request using our [PR template](.github/pull_request_template.md).

### 5. Address Review Feedback

- Respond to review comments
- Make requested changes
- Update tests and documentation
- Request re-review when ready

## Adding New Framework Adapters

### 1. Framework Requirements

Before adding a new framework adapter, ensure:
- Framework is actively maintained
- Has TypeScript support
- Has significant user base
- Fits the adapter pattern

### 2. Adapter Structure

Create a new package in `packages/[framework-name]/`:

```
packages/framework-name/
├── src/
│   ├── checkout.ts        # Checkout implementation
│   ├── webhooks.ts        # Webhook handling
│   ├── customer-portal.ts # Customer portal
│   └── index.ts          # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Implementation Template

```typescript
// src/checkout.ts
import { CheckoutConfig, createCheckoutSession } from '@dodopayments/core';

export function Checkout(config: CheckoutConfig) {
  // Return framework-specific handler
  return (req: FrameworkRequest, res: FrameworkResponse) => {
    // 1. Extract request data (framework-specific)
    // 2. Validate using core
    // 3. Create session
    // 4. Return response
  };
}
```

<!-- ### 4. Required Tests

- Unit tests for all exported functions
- Integration tests with mock server
- Type safety tests
- Error handling tests -->

### 4. Documentation Requirements

- Package README with usage examples
- Framework-specific documentation in `docs/adapters/`
- Update main README with new adapter
- Add example implementation

## Coding Standards

### TypeScript

- **Strict Mode**: All packages use strict TypeScript
- **No Any**: Avoid `any` type, use proper typing
- **Exports**: Use named exports, avoid default exports
- **Imports**: Use absolute imports when possible

### Code Style

- **Prettier**: Code formatting (auto-formatted)
- **ESLint**: Linting rules (must pass)
- **File Naming**: kebab-case for files, PascalCase for components
- **Function Naming**: camelCase for functions, PascalCase for constructors

### Error Handling

```typescript
// Use custom error types from core
import { DodoApiError } from '@dodopayments/core';

// Proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof DodoApiError) {
    // Handle API errors
    return errorResponse(error.status, error.message);
  }
  // Handle unexpected errors
  throw error;
}
```

### Documentation Comments

```typescript
/**
 * Creates a checkout session for the specified product
 * @param config - Checkout configuration including API key and return URL
 * @returns Framework-specific request handler
 * @example
 * ```typescript
 * export const POST = Checkout({
 *   bearerToken: process.env.DODO_API_KEY!,
 *   returnUrl: "https://example.com/success",
 * });
 * ```
 */
export function Checkout(config: CheckoutConfig) {
  // Implementation
}
```

## Documentation Guidelines

### README Requirements

Each adapter package needs:
- Installation instructions
- Basic usage examples
- Framework-specific patterns
- Error handling examples
- Links to main documentation

### Code Documentation

- Document all public APIs
- Include practical examples
- Explain framework-specific behavior
- Document error conditions

## Release Process

### Version Management

- Use semantic versioning (semver)
- Core package drives version updates
- Adapters follow independent versioning
- Breaking changes require major version bump

### Changelog

Update CHANGELOG.md with:
- New features
- Bug fixes
- Breaking changes
- Migration guides

## Getting Help

- **Discord**: [Join our community](https://discord.gg/dodopayments)
- **Issues**: [GitHub Issues](https://github.com/dodopayments/dodo-adapters/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dodopayments/dodo-adapters/discussions)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Documentation credits
- Community highlights

Thank you for contributing to Dodo Adapters! 🎉