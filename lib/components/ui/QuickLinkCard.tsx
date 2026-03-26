// Quick link card component for home page navigation
import Link from 'next/link';

interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export default function QuickLinkCard({ title, description, href, icon }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        {/* Gradient background effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon container */}
          {icon && (
            <div className="mb-6 w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <div className="w-8 h-8 text-white">
                {icon}
              </div>
            </div>
          )}
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-4">
            {description}
          </p>
          
          {/* Arrow indicator */}
          <div className="flex items-center text-gray-900 font-medium group-hover:gap-2 transition-all">
            <span>Get Started</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
