'use client';

import { useEffect, useState } from 'react';

export default function ScrollDown() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const toggleVisibility = () => {
      // Hide button when page is scrolled down 200px
      if (window.scrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollDown = () => {
    const windowHeight = window.innerHeight;
    window.scrollTo({
      top: windowHeight,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollDown}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
      aria-label="Scroll down"
    >
      {/* Mouse Icon */}
      <div className="relative">
        {/* Mouse body */}
        <div 
          className="w-8 h-12 rounded-full border-3 flex items-start justify-center pt-2 shadow-2xl transition-all duration-300"
          style={{
            borderColor: 'var(--color-primary)',
            borderWidth: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Scroll wheel with animation */}
          <div 
            className="w-1.5 h-3 rounded-full animate-mouse-scroll"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
      </div>
    </button>
  );
}
