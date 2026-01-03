import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            Error Code Reference
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/errors"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              All Errors
            </Link>
            <Link
              href="/errors/http"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              HTTP
            </Link>
            <Link
              href="/errors/aws"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              AWS
            </Link>
            <Link
              href="/errors/azure"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Azure
            </Link>
            <Link
              href="/errors/gcp"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              GCP
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}


