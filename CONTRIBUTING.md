# Contributing to Journium JavaScript SDK

Thank you for your interest in contributing to the Journium JavaScript SDK! This document outlines the development process and guidelines.

## Development Setup

1. **Prerequisites**
   - Node.js ≥20.0.0
   - pnpm ≥8.15.0

2. **Installation**
   ```bash
   git clone https://github.com/journium/journium-js.git
   cd journium-js
   pnpm install
   ```

3. **Build and Test**
   ```bash
   pnpm build        # Build all packages
   pnpm lint         # Run linting
   pnpm typecheck    # Type check
   pnpm test         # Run tests
   ```
   
4. **Run sample apps**
   ```bash
   pnpm run dev      # Run all apps and local event monitor
   ```

## Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript with strict mode
   - Follow existing code style (Prettier + ESLint)
   - Add tests for new functionality
   - Update documentation as needed

3. **Add a changeset** for your changes:
   ```bash
   pnpm changeset
   ```
   This generates a changelog entry that will be used for releases.

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new analytics method"
   ```

5. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- **Title**: Use conventional commits format (feat:, fix:, docs:, etc.)
- **Description**: Clearly describe what changes were made and why
- **Tests**: Include tests for new features or bug fixes
- **Documentation**: Update relevant documentation
- **Changesets**: Include a changeset for user-facing changes

## Package Structure

- `@journium/core` - Core types and utilities
- `@journium/js` - Browser JavaScript SDK
- `@journium/react` - React hooks and components
- `@journium/nextjs` - Next.js SSR integration

## Code Style

We use automated formatting and linting:
- **Prettier** for code formatting
- **ESLint** with TypeScript rules
- **TypeScript** in strict mode

Run `pnpm lint:fix` and `pnpm format` before committing.

## Reporting Issues

Please use GitHub Issues to report bugs or suggest features. Include:
- Clear description of the issue
- Steps to reproduce (for bugs)
- Environment details (browser, Node.js version, etc.)
- Expected vs actual behavior

## Questions?

Feel free to open a GitHub Discussion or reach out to the maintainers through GitHub Issues.