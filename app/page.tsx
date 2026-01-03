import Link from 'next/link';
import { getErrorCodesByProvider, type ErrorProvider } from '@/lib/errors';

const providers: { name: string; value: ErrorProvider; description: string; color: string }[] = [
  {
    name: 'HTTP',
    value: 'http',
    description: 'Standard HTTP status codes for web applications',
    color: 'blue',
  },
  {
    name: 'AWS',
    value: 'aws',
    description: 'Amazon Web Services error codes and exceptions',
    color: 'orange',
  },
  {
    name: 'Azure',
    value: 'azure',
    description: 'Microsoft Azure service error codes',
    color: 'cyan',
  },
  {
    name: 'GCP',
    value: 'gcp',
    description: 'Google Cloud Platform error codes',
    color: 'green',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-16 py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Error Code Reference
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Comprehensive reference for HTTP status codes and cloud provider error codes.
          Find detailed explanations, troubleshooting tips, and code examples.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/errors"
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            Browse All Errors
          </Link>
          <Link
            href="/errors/http/404"
            className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold transition-colors"
          >
            View Example
          </Link>
        </div>
      </section>

      {/* Provider Cards */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Browse by Provider
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider) => {
            const errors = getErrorCodesByProvider(provider.value);
            return (
              <Link
                key={provider.value}
                href={`/errors/${provider.value}`}
                className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all group"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{provider.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {errors.length} error{errors.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          What You'll Find
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="text-3xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-white mb-2">Detailed Explanations</h3>
            <p className="text-gray-400">
              Comprehensive descriptions of each error code, what it means, and when it occurs.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-white mb-2">Troubleshooting Tips</h3>
            <p className="text-gray-400">
              Step-by-step solutions and common fixes for resolving error codes.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="text-3xl mb-4">💻</div>
            <h3 className="text-xl font-semibold text-white mb-2">Code Examples</h3>
            <p className="text-gray-400">
              Practical code samples showing how to handle and resolve errors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


