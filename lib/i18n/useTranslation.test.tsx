import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTranslation } from './useTranslation';
import { LanguageProvider } from './LanguageContext';
import { ReactNode } from 'react';

describe('useTranslation', () => {
  it('returns translation function, direction, and language', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current).toHaveProperty('t');
    expect(result.current).toHaveProperty('direction');
    expect(result.current).toHaveProperty('language');
    expect(typeof result.current.t).toBe('function');
  });

  it('has default language as English', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.direction).toBe('ltr');
  });

  it('translation function returns fallback for missing keys', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    // Test with a non-existent key
    const translation = result.current.t('non.existent.key');
    expect(translation).toBe('non.existent.key');
  });
});
