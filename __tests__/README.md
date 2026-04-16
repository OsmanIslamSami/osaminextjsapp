# Testing Guide

## Test Structure

This project uses **Vitest** for unit and component testing with React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

## Test Files

Tests are located alongside their source files with the `.test.ts` or `.test.tsx` extension:

- **Component Tests**: `*.test.tsx` - For React components
- **Hook Tests**: `*.test.ts` - For custom React hooks
- **Utility Tests**: `*.test.ts` - For utility functions

## Current Test Coverage

### ✅ Completed Tests

1. **UI Components**
   - `LoadingSpinner.test.tsx` - Loading spinner component
   - `ConfirmDialog.test.tsx` - Confirmation dialog component

2. **Hooks**
   - `useTranslation.test.ts` - Translation hook
   - `useCurrentUser.test.ts` - User authentication hook

3. **Utilities**
   - `helpers.test.ts` - Common utility functions

## Writing New Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBeTruthy();
  });
});
```

### Async Test Example

```typescript
import { describe, it, expect, waitFor } from 'vitest';

describe('Async Operation', () => {
  it('completes successfully', async () => {
    const result = await fetchData();
    expect(result).toBeDefined();
  });

  it('updates state after async call', async () => {
    const { result } = renderHook(() => useAsyncHook());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Use semantic queries (getByRole, getByLabelText)

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test names that describe what is being tested

3. **Mock External Dependencies**
   - Mock API calls with `vi.fn()`
   - Mock context providers when needed

4. **Test Accessibility**
   - Ensure components have proper ARIA labels
   - Test keyboard navigation where applicable

5. **Avoid Testing Implementation Details**
   - Don't test internal state
   - Don't test CSS classes unless critical to functionality

## Next Steps

To expand test coverage:

1. Add tests for API routes (use Supertest or similar)
2. Add integration tests for key user flows
3. Add E2E tests with Playwright or Cypress
4. Increase coverage to 80%+ for critical paths

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
