'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

const SIZE = 48;
const STROKE_WIDTH = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    setProgress(scrollPercent);
    setIsVisible(scrollTop > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 group transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* SVG circle progress */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Background track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-gray-300 dark:text-zinc-600"
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      {/* Center filled circle with icon */}
      <span
        className="absolute inset-[5px] rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
        style={{ backgroundColor: 'var(--color-primary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        }}
      >
        <ChevronUpIcon className="w-5 h-5 text-white" />
      </span>
    </button>
  );
}
