# Contributing Guidelines

Thank you for your interest in contributing to the WhatsApp Business Admin Panel! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive in all interactions
- Focus on constructive feedback and collaboration
- Help create a positive experience for everyone
- Report any unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Firebase project access for testing
- Basic knowledge of Next.js, React, and TypeScript

### Development Setup

1. Fork the repository and clone your fork:
```bash
git clone https://github.com/your-username/ws-admin.git
cd ws-admin
```

2. Add the upstream repository:
```bash
git remote add upstream https://github.com/original-owner/ws-admin.git
```

3. Install dependencies:
```bash
npm install
```

4. Copy environment variables:
```bash
cp .env.example .env.local
```

5. Set up your Firebase test project and fill in the environment variables

6. Start the development server:
```bash
npm run dev
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature branches
- `bugfix/bug-description` - Bug fix branches
- `hotfix/critical-fix` - Critical production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type usage
- Use type assertions sparingly

```typescript
// Good
interface User {
  id: string;
  email: string;
  displayName: string;
}

// Avoid
const user: any = getUserData();
```

### Component Structure

Follow this structure for React components:

```typescript
// components/ExampleComponent.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ExampleComponentProps {
  title: string;
  onAction: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAction();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
```

### API Route Structure

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    // Your logic here
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Styling Guidelines

- Use Tailwind CSS classes consistently
- Follow shadcn/ui component patterns
- Maintain responsive design principles
- Use CSS variables for theming

```typescript
// Good
<div className="flex items-center justify-between p-4 bg-background border rounded-lg">
  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
  <Button variant="outline" size="sm">Action</Button>
</div>

// Avoid custom CSS when Tailwind classes exist
<div style={{ display: 'flex', padding: '16px' }}>
```

### File Organization

```
src/
├── app/
│   ├── (auth)/          # Route groups
│   ├── api/             # API routes
│   └── globals.css
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── auth/            # Authentication components
│   └── feature-name/    # Feature-specific components
├── lib/
│   ├── utils.ts         # General utilities
│   ├── firebase.ts      # Firebase configuration
│   └── feature-utils.ts # Feature-specific utilities
└── types/
    └── index.ts         # Type definitions
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`, `MessageList`)
- **Files**: kebab-case (`user-profile.tsx`, `message-list.tsx`)
- **Variables/Functions**: camelCase (`userData`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`User`, `MessageData`)

## Testing

### Unit Testing

Write unit tests for utility functions:

```typescript
// lib/__tests__/utils.test.ts
import { formatPhoneNumber, validateEmail } from '../utils';

describe('Utils', () => {
  describe('formatPhoneNumber', () => {
    it('should format phone number correctly', () => {
      expect(formatPhoneNumber('+1234567890')).toBe('+1 234 567 890');
    });
  });

  describe('validateEmail', () => {
    it('should validate email correctly', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

### Component Testing

Test component behavior:

```typescript
// components/__tests__/UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

describe('UserProfile', () => {
  it('should display user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Submitting Changes

### Commit Guidelines

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add Google OAuth integration

fix(webhook): handle missing project ID in webhook URL

docs(api): update API documentation for new endpoints

refactor(components): extract common button variants

test(utils): add tests for phone number formatting
```

### Pull Request Process

1. Ensure your branch is up to date with the target branch
2. Run linting and tests:
```bash
npm run lint
npm run test
npm run build
```

3. Create a pull request with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots for UI changes
   - Link to related issues

4. Fill out the pull request template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Code Review Process

- All pull requests require review from maintainers
- Address feedback promptly and professionally
- Make requested changes in additional commits
- Once approved, maintainers will merge using squash merge

## Issue Guidelines

### Bug Reports

When reporting bugs, include:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Node.js version: [e.g., 18.0.0]

## Additional Context
Screenshots, logs, etc.
```

### Feature Requests

When requesting features, include:

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Mockups, examples, etc.
```

## Development Tips

### Firebase Development

- Use Firebase Emulator Suite for local development
- Keep Firestore security rules up to date
- Test with different user permissions
- Monitor Firebase usage during development

### Debugging

- Use browser dev tools for frontend debugging
- Check server logs for API issues
- Use Firebase Console for database debugging
- Test webhook endpoints with tools like ngrok

### Performance

- Use React DevTools Profiler for performance analysis
- Optimize bundle size with webpack-bundle-analyzer
- Monitor Lighthouse scores for web vitals
- Test with slow network conditions

### Security

- Never commit sensitive data (API keys, tokens)
- Validate all user inputs
- Test with different user permissions
- Follow OWASP security guidelines

## Documentation

When adding features:

- Update relevant documentation files
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Include examples in documentation

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search through existing issues
3. Create a new issue with the "question" label
4. Join our community discussions

Thank you for contributing to the WhatsApp Business Admin Panel!