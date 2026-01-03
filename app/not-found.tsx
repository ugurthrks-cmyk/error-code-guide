import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/errors"
          className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Browse Errors
        </Link>
      </div>
    </div>
  );
}


