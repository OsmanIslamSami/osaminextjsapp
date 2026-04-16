import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import PaginationControls from './PaginationControls';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('PaginationControls', () => {
  const mockProps = {
    currentPage: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
    limit: 20,
    onLimitChange: vi.fn(),
    total: 100,
  };

  it('renders page numbers', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onPageChange when page number is clicked', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);
    expect(mockProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    renderWithProviders(<PaginationControls {...mockProps} currentPage={1} />);
    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    renderWithProviders(<PaginationControls {...mockProps} currentPage={5} />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('shows total count information', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('renders limit options in select', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('calls onLimitChange when limit changes', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '50' } });
    expect(mockProps.onLimitChange).toHaveBeenCalledWith(50);
  });

  it('highlights current page', () => {
    renderWithProviders(<PaginationControls {...mockProps} />);
    const currentPageButton = screen.getByText('2');
    expect(currentPageButton.closest('button')).toHaveClass('bg-gray-900');
  });
});
