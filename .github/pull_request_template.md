## 📝 Description

Brief description of what this PR does and why.

Fixes # (issue number if applicable)

## 🔄 Type of Change

Please check the type of change your PR introduces:

- [ ] 🐛 **Bug fix** (non-breaking change which fixes an issue)
- [ ] ✨ **New feature** (non-breaking change which adds functionality)
- [ ] 💥 **Breaking change** (fix or feature that would cause existing functionality to not work as expected)
- [ ] 🚀 **New adapter** (adds support for a new framework)
- [ ] 📚 **Documentation** (changes to documentation only)
- [ ] 🎨 **Code style** (formatting, missing semicolons, etc; no production code change)
- [ ] ♻️ **Refactoring** (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ **Performance** (code change that improves performance)

## 🎯 Affected Packages

Which packages are affected by this change:

- [ ] `@dodopayments/core`
- [ ] `@dodopayments/nextjs`
- [ ] `@dodopayments/express`
- [ ] `@dodopayments/fastify`
- [ ] `@dodopayments/hono`
- [ ] `@dodopayments/remix`
- [ ] `@dodopayments/sveltekit`
- [ ] `@dodopayments/astro`
- [ ] `@dodopayments/tanstack`
- [ ] `@dodopayments/nuxt`
- [ ] `@dodopayments/betterauth`
- [ ] `@dodopayments/convex`
- [ ] Examples
- [ ] Documentation

<!-- ## 🧪 Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the changes in a real application environment
- [ ] E2E tests pass (if applicable)

### Test Coverage

Please describe the tests you've added or modified:

- [ ] Unit tests for new functionality
- [ ] Integration tests with framework
- [ ] Error handling tests
- [ ] Type safety tests
- [ ] E2E tests (if applicable) -->

## 📚 Documentation

- [ ] I have updated the README.md (if applicable)
- [ ] I have added/updated code comments for complex logic
- [ ] I have updated the CHANGELOG.md (if applicable)

## 🔍 Code Quality

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] My changes generate no new warnings
- [ ] I have checked my code for potential security issues

## 🚀 Framework Adapter Checklist

If you're adding a new framework adapter, please ensure:

- [ ] Follows the standard adapter pattern
- [ ] Implements all three core functions (Checkout, Webhooks, CustomerPortal)
- [ ] Has framework-specific documentation
- [ ] Includes working example implementation
- [ ] Follows framework conventions and best practices
- [ ] Has proper TypeScript types
- [ ] Handles errors appropriately

## 🔐 Security Considerations

- [ ] I have not exposed any sensitive information (API keys, secrets)
- [ ] My changes don't introduce security vulnerabilities
- [ ] I have followed security best practices
- [ ] Input validation is properly implemented
- [ ] Error messages don't leak sensitive information

## 📖 Additional Context

Add any other context, screenshots, or additional information about the PR here.

### Breaking Changes

If this PR introduces breaking changes, please describe:

1. What changes are breaking
2. Why the change was necessary
3. Migration guide for users
4. Deprecation timeline (if applicable)

### Performance Impact

If this PR affects performance:

- [ ] I have benchmarked the changes
- [ ] Performance improvements are documented
- [ ] No significant performance regressions

### Dependencies

- [ ] I have not added unnecessary dependencies
- [ ] New dependencies are justified and documented
- [ ] Dependencies are compatible with project requirements
- [ ] I have updated package.json correctly

## 🎯 Reviewer Notes

Specific areas to focus on during review:

- [ ] **API Design** - Check consistency with existing patterns
- [ ] **Error Handling** - Verify proper error handling and messages
- [ ] **Type Safety** - Ensure full TypeScript compliance
- [ ] **Framework Integration** - Verify framework-specific implementation
- [ ] **Documentation** - Check completeness and accuracy
- [ ] **Security** - Review for potential security issues

## 📋 Pre-merge Checklist

- [ ] All CI checks are passing
- [ ] Code has been reviewed and approved
- [ ] Documentation is complete and accurate
- [ ] Breaking changes are properly documented
- [ ] CHANGELOG.md is updated (if applicable)

---

By submitting this pull request, I confirm that my contribution is made under the terms of the GPL v3 license and that I have the right to submit this work under this license.
