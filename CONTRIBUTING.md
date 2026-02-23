# Contributing to SlowGuardian

Thank you for your interest in contributing to SlowGuardian! This document outlines the process for contributing code, documentation, and bug reports.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 7.0.0
- Git
- A modern web browser for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SlowGuardian.git
   cd SlowGuardian
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/zgr2575/SlowGuardian.git
   ```

## How to Contribute

### Development Workflow

1. Sync your fork with the upstream repository:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes, following the [Code Style](#code-style) guidelines.

4. Run quality checks before committing:
   ```bash
   npm run lint
   npm run format
   npm test
   ```

5. Commit with a clear, descriptive message:
   ```bash
   git commit -m "feat: add keyboard shortcut for search focus"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request against the `main` branch.

### Commit Message Format

Use conventional commit format:

- `feat:` – new feature
- `fix:` – bug fix
- `docs:` – documentation changes
- `style:` – formatting, whitespace (no logic changes)
- `refactor:` – code restructuring without feature/fix
- `test:` – adding or updating tests
- `chore:` – build process, dependency updates

## Development Setup

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Run tests
npm test
```

The server starts at `http://localhost:8080` by default.

## Code Style

- **JavaScript**: ES2022+, 2-space indentation, double quotes, semicolons
- **HTML**: 2-space indentation, lowercase attributes, semantic elements
- **CSS**: 2-space indentation, CSS custom properties for theming, BEM-adjacent naming
- Formatting is enforced by Prettier (`.prettierrc.json`) and ESLint (`.eslintrc.json`)
- Run `npm run format` before committing to avoid CI failures

### Frontend Guidelines

- Avoid adding external dependencies for the frontend – keep it vanilla JS
- Use CSS custom properties defined in `assets/styles/v9/variables.css` for colors and spacing
- Ensure all UI changes are tested at mobile widths (320px, 375px, 768px)
- Do not inline styles directly in HTML when a CSS class can be used instead

### Backend Guidelines

- All new API routes go under `src/routes/`
- Use middleware in `src/middleware/` for authentication and validation
- Log errors using the logger in `src/utils/logger.js`, not `console.error`

## Submitting a Pull Request

Before opening a PR, make sure:

- [ ] All existing tests pass (`npm test`)
- [ ] No new linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] UI changes are tested across desktop and mobile
- [ ] You have updated relevant documentation if needed

Your PR will be reviewed by a maintainer. Feedback may be requested before merging. PRs that do not meet the quality standards above will be asked to make corrections before review.

## Reporting Bugs

Before filing a bug, check that it hasn't already been reported in [GitHub Issues](https://github.com/zgr2575/SlowGuardian/issues).

When reporting a bug, include:

1. **SlowGuardian version** (check the footer or `version.txt`)
2. **Browser and OS** (e.g., Chrome 120 on macOS 14)
3. **Steps to reproduce** – numbered, minimal steps
4. **Expected behavior** – what you expected to happen
5. **Actual behavior** – what actually happened
6. **Console errors** – paste any errors from the browser console
7. **Screenshots** – if applicable

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when opening the issue.

> **Security vulnerabilities**: Do **not** create a public issue. See [SECURITY.md](SECURITY.md) for the private disclosure process.

## Suggesting Features

Feature requests are welcome. Open a [GitHub Issue](https://github.com/zgr2575/SlowGuardian/issues) using the Feature Request template and describe:

- The problem your feature solves
- Your proposed solution
- Any alternatives you considered
- Whether you are willing to implement it yourself

## Questions

For general questions and discussion, use [GitHub Discussions](https://github.com/zgr2575/SlowGuardian/discussions) rather than opening an issue.
