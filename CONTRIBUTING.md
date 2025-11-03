# Contributing to Limpopo Connect

Thank you for your interest in contributing to Limpopo Connect! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing](#testing)
7. [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Limpopo-Connect.git
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Tshikwetamakole/Limpopo-Connect.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

3. Keep your branch updated:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. Update the README.md with details of changes if required
2. Update documentation in the /docs folder
3. Add tests for new features
4. Ensure all tests pass
5. Update the CHANGELOG.md
6. Submit your PR with a clear title and description

### PR Title Format
- feat: Add new feature
- fix: Fix bug
- docs: Update documentation
- style: Format code
- refactor: Refactor code
- test: Add tests
- chore: Update dependencies

## Coding Standards

### TypeScript
- Use TypeScript strict mode
- Define interfaces for data models
- Use proper type annotations
- Avoid any types

### React
- Use functional components
- Implement proper error boundaries
- Follow React hooks best practices
- Use proper prop types

### CSS/Styling
- Use Tailwind CSS utilities
- Follow BEM naming convention for custom CSS
- Maintain responsive design principles

## Testing

Before submitting a PR:

1. Run unit tests:
   ```bash
   npm run test
   ```

2. Run API tests:
   ```bash
   npm run test:api
   ```

3. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

4. Check test coverage:
   ```bash
   npm run test:coverage
   ```

## Documentation

- Update relevant documentation in /docs
- Add JSDoc comments for new functions/components
- Update API documentation if endpoints change
- Include examples for new features

## Security

- Never commit sensitive data
- Follow secure coding practices
- Implement proper input validation
- Use prepared statements for database queries
- Follow OWASP security guidelines

## Questions?

Feel free to:
- Open an issue
- Join our Discord server
- Email: contribute@limpopoconnect.site

Thank you for contributing to Limpopo Connect! 🎉