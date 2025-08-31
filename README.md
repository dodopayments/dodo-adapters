# Dodo Payments Adapters

<p align="left">
  <a href="https://discord.gg/bYqAp4ayYh">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Chat on Discord" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License: GPLv3" />
  </a>
</p>


Framework-specific adapters for seamless [Dodo Payments](https://dodopayments.com) integration across web frameworks.

## 🚀 Quick Start

```bash
# Choose your framework
npm install @dodopayments/nextjs     # Next.js
npm install @dodopayments/express    # Express
npm install @dodopayments/fastify    # Fastify
npm install @dodopayments/hono       # Hono
```

### Basic Setup

```typescript
// Next.js example - app/api/checkout/route.ts
import { Checkout, Webhooks } from '@dodopayments/nextjs';

export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: "https://yourapp.com/success",
});

export const POST = Webhooks({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  webhookSecret: process.env.DODO_WEBHOOKS_SECRET!,
  onPaymentCompleted: async (payload) => {
    // Handle payment success
  },
});
```

## 📦 Available Adapters

| Framework | Package | Status |
|-----------|---------|--------|
| Next.js | `@dodopayments/nextjs` | ✅ |
| Express | `@dodopayments/express` | ✅ |
| Fastify | `@dodopayments/fastify` | ✅ |
| Hono | `@dodopayments/hono` | ✅ |
| Remix | `@dodopayments/remix` | ✅ |
| SvelteKit | `@dodopayments/sveltekit` | ✅ |
| Astro | `@dodopayments/astro` | ✅ |
| TanStack | `@dodopayments/tanstack` | ✅ |
| Nuxt | `@dodopayments/nuxt` | ✅ |
| BetterAuth | `@dodopayments/betterauth` | ✅ |

## 🔧 Features

- **🎯 Framework Agnostic**: Unified API across all frameworks
- **🔒 Type-Safe**: Full TypeScript support with strict typing
- **⚡ Easy Integration**: Minimal setup, maximum functionality
- **🔐 Secure**: Built-in webhook verification and validation
- **📊 Complete**: Checkout, webhooks, and customer portal

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and setup
- **[Core Concepts](./docs/core-concepts.md)** - Architecture overview
- **[API Reference](./docs/api-reference/)** - Complete API documentation
- **[Examples](./docs/examples/)** - Working code examples
- **[Framework Guides](./docs/adapters/)** - Framework-specific documentation

## 🏗️ Project Structure

```
packages/
├── core/                   # Shared functionality and types
├── nextjs/                # Next.js adapter (App & Pages Router)
├── express/               # Express middleware
├── fastify/               # Fastify plugin
├── hono/                  # Hono adapter
├── remix/                 # Remix action/loader support
├── sveltekit/             # SvelteKit hooks
├── astro/                 # Astro endpoints
├── tanstack/              # TanStack Start adapter
├── nuxt/                  # Nuxt 3 server routes
└── betterauth/            # BetterAuth plugin

examples/
├── nextjs-basic/          # Basic Next.js implementation
└── nextjs-betterauth/     # Next.js + BetterAuth integration
```

## 🛠️ Development

### Setup

```bash
# Clone repository
git clone https://github.com/dodopayments/dodo-adapters.git
cd dodo-adapters

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development
npm run dev
```

### Commands

```bash
# Build all packages
turbo build

# Build specific package
turbo build --filter=@dodopayments/nextjs

# Run tests
turbo test

# Type checking
turbo typecheck

# Linting
turbo lint

# Format code
turbo format
```

## 🧪 Testing

Each adapter includes comprehensive test coverage:

- **Unit Tests**: Core functionality and validation
- **Integration Tests**: Framework-specific implementations
- **E2E Tests**: Complete checkout flows (examples)

```bash
# Run all tests
npm test

# Run specific package tests
npm test --filter=@dodopayments/nextjs

# E2E tests (examples)
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

See [Contributing Guide](./CONTRIBUTING.md) for detailed instructions on adding new framework adapters.

## 📄 License

GPL v3 License - see [LICENSE](./LICENSE) for details.

This project is licensed under the GNU General Public License v3.0. You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.
