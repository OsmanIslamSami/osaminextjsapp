// Quick link card component for home page navigation
import Link from 'next/link';

interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

export default function QuickLinkCard({ title, description, href, icon }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
        {icon && (
          <div className="text-4xl mb-4">{icon}</div>
        )}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
