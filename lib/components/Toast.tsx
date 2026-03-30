'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-500',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-500',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
  }[type];

  const textColor = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[type];

  const Icon = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
  }[type];

  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[9999] animate-slide-in-right`}>
      <div className={`${bgColor} ${textColor} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium break-words">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
