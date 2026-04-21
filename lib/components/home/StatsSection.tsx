'use client';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { logger } from '@/lib/utils/logger';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface MetricsData {
  clientCount: number;
  orderCount: number;
  thisMonthClients: number;
  thisMonthOrders: number;
}

function CountUpAnimation({ end, duration = 2000, startCounting }: { end: number; duration?: number; startCounting: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, startCounting]);

  return <span>{count.toLocaleString()}</span>;
}

function StatCard({ label, value, icon, color, startCounting }: Stat & { startCounting: boolean }) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Colored accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
      
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color.replace('bg-', 'bg-').replace('-500', '-100')} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <div className={`w-6 h-6 ${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900">
          <CountUpAnimation end={value} duration={2500} startCounting={startCounting} />
        </div>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-600">
        {label}
      </div>
    </div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startCounting, setStartCounting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        logger.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Intersection Observer for scroll-triggered counter animation
  useEffect(() => {
    if (loading || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startCounting) {
          setStartCounting(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);

    // Check if already in viewport on mount
    const rect = sectionRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setStartCounting(true);
    }

    return () => observer.disconnect();
  }, [loading, startCounting]);

  if (loading) {
    return (
      <div className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mb-3 animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-8 bg-gray-200 rounded mb-2 w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const stats: Stat[] = [
    {
      label: t('home.totalClientsLabel'),
      value: metrics.clientCount,
      color: 'bg-blue-500',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
    {
      label: t('home.totalOrdersLabel'),
      value: metrics.orderCount,
      color: 'bg-green-500',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
    },
    {
      label: t('home.thisMonthClientsLabel'),
      value: metrics.thisMonthClients,
      color: 'bg-purple-500',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
    },
    {
      label: t('home.thisMonthOrdersLabel'),
      value: metrics.thisMonthOrders,
      color: 'bg-orange-500',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      ),
    },
  ];

  return (
    <div 
      ref={sectionRef}
      className="py-16 px-4 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {t('home.quickOverview')}
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            {t('home.statsSubtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index}>
              <StatCard {...stat} startCounting={startCounting} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
