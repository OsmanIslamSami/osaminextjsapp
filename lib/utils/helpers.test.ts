import { describe, it, expect } from 'vitest';

/**
 * Helper function tests
 * Add tests for utility functions as they are created
 */

describe('Date Formatting Utilities', () => {
  it('formats date to ISO string', () => {
    const date = new Date('2026-04-16T12:00:00Z');
    const isoString = date.toISOString();
    expect(isoString).toBe('2026-04-16T12:00:00.000Z');
  });

  it('formats date for display', () => {
    const date = new Date('2026-04-16');
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    expect(formatted).toContain('2026');
  });
});

describe('String Utilities', () => {
  it('truncates long strings', () => {
    const truncate = (str: string, length: number) => {
      return str.length > length ? str.substring(0, length) + '...' : str;
    };

    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('capitalizes first letter', () => {
    const capitalize = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });
});

describe('Array Utilities', () => {
  it('chunks array into smaller arrays', () => {
    const chunk = <T,>(arr: T[], size: number): T[][] => {
      const result: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };

    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = chunk(input, 3);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
  });

  it('removes duplicates from array', () => {
    const unique = <T,>(arr: T[]): T[] => {
      return Array.from(new Set(arr));
    };

    expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

describe('Validation Utilities', () => {
  it('validates email format', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  it('validates URL format', () => {
    const isValidURL = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('http://example.com')).toBe(true);
    expect(isValidURL('not-a-url')).toBe(false);
  });
});
