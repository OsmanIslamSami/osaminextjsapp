'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
}: ConfirmDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop with animation */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50 dark:bg-opacity-70' : 'bg-opacity-0'
        }`}
        onClick={onCancel}
        aria-label="Close dialog"
      ></div>
      
      {/* Dialog with scale animation and responsive sizing */}
      <div 
        className={`relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl 
          w-full max-w-sm sm:max-w-md md:max-w-lg
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          border border-gray-200 dark:border-zinc-800`}
      >
        {/* Content container with responsive padding */}
        <div className="p-5 sm:p-6 md:p-7">
          {/* Title */}
          <h3 
            id="dialog-title"
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-zinc-50 mb-3 sm:mb-4 leading-tight"
          >
            {title}
          </h3>
          
          {/* Message */}
          <div className="text-sm sm:text-base text-gray-700 dark:text-zinc-300 mb-6 sm:mb-8 leading-relaxed">
            {message}
          </div>
          
          {/* Action buttons - responsive layout */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 
                border border-gray-300 dark:border-zinc-700 
                rounded-lg sm:rounded-md
                hover:bg-gray-100 dark:hover:bg-zinc-800 
                active:bg-gray-200 dark:active:bg-zinc-700
                transition-all duration-200
                text-gray-900 dark:text-zinc-50
                font-medium text-sm sm:text-base
                focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              type="button"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 
                text-white rounded-lg sm:rounded-md
                font-medium text-sm sm:text-base
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
                active:scale-95
                ${confirmButtonClass}`}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
