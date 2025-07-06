# Dodo Payments Adapters

A collection of framework-specific adapters for integrating Dodo Payments into your applications.

## Available Adapters

### Framework Adapters

- `@dodo/nextjs`: Next.js adapter for App Router
- `@dodo/honojs`: Hono.js adapter for lightweight web applications
- `@dodo/core`: Core functionality shared across all adapters
- `@dodo/typescript-config`: TypeScript configurations used throughout the monorepo

Each package is 100% [TypeScript](https://www.typescriptlang.org/).

## Quick Start

### Next.js Adapter

```bash
npm install @dodo/nextjs zod next
```

### Hono.js Adapter

```bash
npm install @dodo/honojs zod hono
# or with Bun (recommended)
bun add @dodo/honojs zod hono
```

### Development Tools

This monorepo includes the following development tools:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Prettier](https://prettier.io) for code formatting
- [Turbo](https://turbo.build/) for build system and monorepo management

## Documentation

For detailed implementation guides and examples:

- **Next.js**: See [packages/nextjs/README.md](packages/nextjs/README.md)
- **Hono.js**: See [packages/honojs/README.md](packages/honojs/README.md)
- **Core**: See [packages/core/README.md](packages/core/README.md) (if available)

## Development

### Build

To build all packages, run:

```bash
npm install
npx turbo build
```

To build a specific adapter:

```bash
# Build Next.js adapter
npx turbo build --filter=@dodo/nextjs

# Build Hono.js adapter
npx turbo build --filter=@dodo/honojs

# Build core package
npx turbo build --filter=@dodo/core
```

### Development Mode

To develop all packages with file watching:

```bash
npx turbo dev
```

To develop a specific adapter:

```bash
# Develop Next.js adapter
npx turbo dev --filter=@dodo/nextjs

# Develop Hono.js adapter  
npx turbo dev --filter=@dodo/honojs

# Develop core package
npx turbo dev --filter=@dodo/core
```

### Using Bun (Recommended for Hono.js)

For faster development when working with the Hono.js adapter:

```bash
bun install
bun run dev --filter=@dodo/honojs
```

## Features

### Checkout Handler
- Redirect users to Dodo Payments checkout
- Support for query parameters (product ID, quantity, customer info)
- Customizable success URLs

### Customer Portal Handler
- Secure customer portal access
- Subscription management
- Payment history

### Webhook Handler
- Secure webhook verification
- Support for all Dodo Payments event types
- Granular event handlers

## Environment Variables

All adapters support the following environment variables:

```env
DODO_PAYMENTS_API_KEY=your-api-key
SUCCESS_URL=https://your-app.com/success
DODO_WEBHOOK_SECRET=your-webhook-secret
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the build and ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the adapter-specific documentation
- Open an issue on GitHub
- Visit the Dodo Payments documentation
